from fastapi import FastAPI, HTTPException, Query
import joblib
import pandas as pd
import mysql.connector
from datetime import datetime
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# DB config
db_config = {
    'host': os.getenv("DB_HOST"),
    'user': os.getenv("DB_USER"),
    'password': os.getenv("DB_PASSWORD"),
    'database': os.getenv("DB_NAME"),
    'ssl_disabled': True
}

app = FastAPI(root_path="/loyalty-engine-hackathon/aiml")

# app = FastAPI()

# Load trained models
shipway_loyalty_model = joblib.load("shipway-model.pkl")
# unicommerce_loyalty_model = joblib.load("unicommerce-model.pkl")
# convertway_loyalty_model = joblib.load("convertway-model.pkl")
# churn_model = joblib.load("merchant_churn_model.pkl")

# Feature list
LOYALTY_FEATURES = [
    'order_count', 'billing_amount', 'margin_amount', 'complaint_count',
    'returned_orders', 'undelivered_orders', 'services_amount',
    'merchant_age_days', 'return_rate', 'margin_ratio'
]

# Model map
model_map = {
    'shipway': shipway_loyalty_model
    # 'unicommerce': unicommerce_loyalty_model,
    # 'convertway': convertway_loyalty_model
}

@app.get("/loyalty-score")
def get_loyalty_score_by_integration(
    email: str = Query(...),
    platform: str = Query(...)
):
    platform = platform.lower()

    if platform not in model_map:
        raise HTTPException(status_code=400, detail="Invalid platform.")

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # Get merchant data
        cursor.execute(f"""
            SELECT merchant_id, is_{platform}, multiplier_{platform}
            FROM merchants
            WHERE email = %s
        """, (email,))
        merchant = cursor.fetchone()

        if not merchant:
            raise HTTPException(status_code=404, detail="Merchant not found")

        # Read latest transaction data
        df = pd.read_sql(f"""
            SELECT s.*, m.is_{platform}
            FROM data_{platform} s
            JOIN merchants m ON m.merchant_id = s.merchant_id
            WHERE m.email = %s
            ORDER BY s.till_date DESC LIMIT 1
        """, conn, params=(email,))

        if df.empty:
            raise HTTPException(status_code=404, detail="No data found for platform")

        # Feature engineering
        df['from_date'] = pd.to_datetime(df['from_date'])
        df['merchant_age_days'] = (pd.Timestamp.now() - df['from_date']).dt.days
        df['return_rate'] = df['undelivered_orders'] / df['order_count'].replace(0, 1)
        df['margin_ratio'] = df['margin_amount'] / df['billing_amount'].replace(0, 1)

        # Predictions
        model = model_map[platform]
        score = model.predict(df[LOYALTY_FEATURES])[0]
        # churn_rate = churn_model.predict(df[LOYALTY_FEATURES])[0]

        weighted_score = score * merchant[f'multiplier_{platform}']

        # Prepare DB insert fields
        merchant_id = df.at[0, 'merchant_id']
        till_date = pd.to_datetime(df.at[0, 'till_date']).date()
        from_date = till_date.replace(day=1)

        # DB column names
        loyalty_col = f"loyalty_score_{platform}"
        churn_col = f"churn_rate_{platform}"
        sync_col = f"sync_till_{platform}"

        # Save scores (upsert)
        upsert_query = f"""
            INSERT INTO merchants_scores (
                merchant_id, {loyalty_col}, {churn_col}, {sync_col}, updated_on
            ) VALUES (%s, %s, %s, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
                {loyalty_col} = VALUES({loyalty_col}),
                {churn_col} = VALUES({churn_col}),
                {sync_col} = NOW(),
                updated_on = NOW()
        """
        cursor.execute(upsert_query, (merchant_id, score, churn_rate))

        # Save into history
        history_query = f"""
            INSERT INTO merchants_scores_history (
                merchant_id, from_date, till_date, {loyalty_col}, {churn_col}, added_on
            ) VALUES (%s, %s, %s, %s, %s, NOW())
            ON DUPLICATE KEY UPDATE
                till_date = VALUES(till_date),
                {loyalty_col} = VALUES({loyalty_col}),
                {churn_col} = VALUES({churn_col}),
                updated_on = NOW()
        """
        cursor.execute(history_query, (merchant_id, from_date, till_date, score, churn_rate))

        conn.commit()

        return {
            "email": email,
            "merchant_id": merchant_id,
            "platform": platform,
            "loyalty_score": round(float(score), 2),
            "merchant_churn_rate": round(float(churn_rate), 2),
            "weighted_score": round(float(weighted_score), 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@app.get("/loyalty-score/multi-platform")
def get_loyalty_scores_for_all_platforms(
    email: str = Query(...)
):
    platforms = ['shipway', 'unicommerce', 'convertway']
    results = []

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        total_weighted_score = 0
        platform_count = 0

        for platform in platforms:
            cursor.execute(f"""
                SELECT merchant_id, multiplier_{platform} FROM merchants
                WHERE email = %s AND is_{platform} = '1'
            """, (email,))
            row = cursor.fetchone()

            if row:
                try:
                    score_data = get_loyalty_score_by_integration(email=email, platform=platform)
                    multiplier = row.get(f"multiplier_{platform}", 1)
                    
                    # Multiply score by the multiplier
                    weighted_score = score_data['loyalty_score'] * multiplier
                    results.append(score_data)
                    total_weighted_score += weighted_score
                    platform_count += 1

                except HTTPException as he:
                    if he.status_code != 404:
                        raise he

        if not results:
            raise HTTPException(status_code=404, detail="Merchant not found on any platform or no data.")

        grand_loyalty_score = round(total_weighted_score / platform_count, 2) if platform_count > 0 else 0
        grand_badge = None

        if grand_loyalty_score >= 50:
            grand_badge = 'platinum'
        elif grand_loyalty_score >= 20:
            grand_badge = 'gold'
        elif grand_loyalty_score >= 10:
            grand_badge = 'silver'
        else:
            grand_badge = None  # or 'bronze', 'starter', etc., if needed

        return {
            "email": email,
            "platform_scores": results,
            "grand_loyalty_score": grand_loyalty_score,
            "grand_badge": grand_badge
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass

if __name__ == "__main__":
    uvicorn.run("score_api:app", host="127.0.0.1", port=int(os.getenv("PORT", 8000)), reload=True)
