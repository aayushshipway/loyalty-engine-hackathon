import pandas as pd
import joblib
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sqlalchemy import create_engine
import os
from urllib.parse import quote_plus

from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

# Now you can access them like this:
host = os.getenv("DB_HOST")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
database = os.getenv("DB_NAME")

password_encoded = quote_plus(password)
connection_str = f"mysql+pymysql://{user}:{password_encoded}@{host}/{database}"
engine = create_engine(connection_str)

# Load transactional data
query_txn = """
    SELECT
        m.merchant_id,
        m.register_shipway,
        s.order_count,
        s.billing_amount,
        s.margin_amount,
        s.complaint_count,
        s.returned_orders,
        s.undelivered_orders,
        s.services_amount,
        s.delayed_orders,
        s.average_resolution_tat
    FROM merchants m
    JOIN data_shipway s ON m.merchant_id = s.merchant_id
"""
df_txn = pd.read_sql(query_txn, engine)

# Load historical score data
query_hist = """
    SELECT
        merchant_id,
        MAX(till_date) AS latest_date,
        AVG(loyalty_score_shipway) AS avg_loyalty_score,
        AVG(churn_rate_shipway) AS avg_churn_rate,
        MAX(loyalty_score_shipway) - MIN(loyalty_score_shipway) AS loyalty_score_delta,
        COUNT(*) AS history_months
    FROM merchants_scores_history
    GROUP BY merchant_id
"""
df_hist = pd.read_sql(query_hist, engine)

# Merge transactional data with historical score features
merged_df = pd.merge(df_txn, df_hist, on="merchant_id", how="left")

# Feature engineering
merged_df['register_shipway'] = pd.to_datetime(merged_df['register_shipway'])
merged_df['merchant_age_days'] = (datetime.now() - merged_df['register_shipway']).dt.days
merged_df['return_rate'] = merged_df['undelivered_orders'] / merged_df['order_count'].replace(0, 1)
merged_df['margin_ratio'] = merged_df['margin_amount'] / merged_df['billing_amount'].replace(0, 1)

# Create pseudo-label for loyalty score
merged_df['label'] = (
    0.20 * merged_df['order_count'].rank(pct=True) +
    0.15 * merged_df['margin_amount'].rank(pct=True) +
    0.10 * merged_df['margin_ratio'].rank(pct=True) +
    0.10 * merged_df['services_amount'].rank(pct=True) +
    0.10 * merged_df['merchant_age_days'].rank(pct=True) -
    0.10 * merged_df['undelivered_orders'].rank(pct=True) -
    0.05 * merged_df['complaint_count'].rank(pct=True) +
    0.10 * merged_df['avg_loyalty_score'].rank(pct=True) -
    0.05 * merged_df['avg_churn_rate'].rank(pct=True)
) * 100

# Feature columns
features = [
    'order_count', 'billing_amount', 'margin_amount', 'complaint_count',
    'returned_orders', 'undelivered_orders', 'services_amount',
    'delayed_orders', 'average_resolution_tat', 'merchant_age_days',
    'return_rate', 'margin_ratio', 'avg_loyalty_score', 'avg_churn_rate',
    'loyalty_score_delta', 'history_months'
]

# Prepare training data
X = merged_df[features].fillna(0)
y = merged_df['label']

# Train model
model = RandomForestRegressor(n_estimators=500, random_state=5)
model.fit(X, y)

# Save model
joblib.dump(model, "shipway-model.pkl")
print("Model trained and saved as shipway-model.pkl")
