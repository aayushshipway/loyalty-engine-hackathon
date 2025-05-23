import pandas as pd
import joblib
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
import mysql.connector
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

# Now you can access them like this:
db_host = os.getenv("DB_HOST")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_name = os.getenv("DB_NAME")

# DB config
db_config = {
    'host': db_host,
    'user': db_user,
    'password': db_password,
    'database': db_name,
}

# Connect and fetch data
conn = mysql.connector.connect(**db_config)
query = """
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
df = pd.read_sql(query, conn)
conn.close()

# Feature engineering
df['register_shipway'] = pd.to_datetime(df['register_shipway'])
df['merchant_age_days'] = (datetime.now() - df['register_shipway']).dt.days
df['return_rate'] = df['undelivered_orders'] / df['order_count'].replace(0, 1)
df['margin_ratio'] = df['margin_amount'] / df['billing_amount'].replace(0, 1)

# Create churn risk score (pseudo-label) — higher means higher churn risk
df['churn_risk'] = (
    0.30 * df['delayed_orders'].rank(pct=True) +
    0.25 * df['complaint_count'].rank(pct=True) +
    0.20 * df['average_resolution_tat'].rank(pct=True) +
    0.15 * df['returned_orders'].rank(pct=True) +
    0.10 * df['undelivered_orders'].rank(pct=True)
) * 100

# Features used for prediction
features = [
    'delayed_orders',
    'complaint_count',
    'average_resolution_tat',
    'returned_orders',
    'undelivered_orders',
    'merchant_age_days',
    'order_count',
    'return_rate',
    'margin_ratio'
]

# Drop rows with missing values if any
df = df.dropna(subset=features + ['churn_risk'])

X = df[features]
y = df['churn_risk']

# Train model
model = RandomForestRegressor(n_estimators=500, random_state=42)
model.fit(X, y)

# Save model to disk
joblib.dump(model, "merchant_churn_model.pkl")
print("Churn model trained and saved as merchant_churn_model.pkl")
