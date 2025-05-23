import pandas as pd
import joblib
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sqlalchemy import create_engine
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

host = os.getenv("DB_HOST")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
database = os.getenv("DB_NAME")

# Encode password for URL
password_encoded = quote_plus(password)
connection_str = f"mysql+pymysql://{user}:{password_encoded}@{host}/{database}"
engine = create_engine(connection_str)

# Load transactional data from Convertway
query_txn = """
    SELECT
        m.merchant_id,
        m.register_convertway,
        s.order_count,
        s.billing_amount,
        s.margin_amount,
        s.nps_score
    FROM merchants m
    JOIN data_convertway s ON m.merchant_id = s.merchant_id
"""
df_txn = pd.read_sql(query_txn, engine)

# Handle missing values early
df_txn = df_txn.fillna(0)

# Feature engineering
df_txn['register_convertway'] = pd.to_datetime(df_txn['register_convertway'], errors='coerce')
df_txn['merchant_age_days'] = (datetime.now() - df_txn['register_convertway']).dt.days.fillna(0)
df_txn['margin_ratio'] = df_txn['margin_amount'] / df_txn['billing_amount'].replace(0, 1)

# Create pseudo-label (basic scoring heuristic)
df_txn['label'] = (
    0.30 * df_txn['order_count'].rank(pct=True) +
    0.20 * df_txn['margin_amount'].rank(pct=True) +
    0.15 * df_txn['margin_ratio'].rank(pct=True) +
    0.15 * df_txn['merchant_age_days'].rank(pct=True) +
    0.20 * df_txn['nps_score'].rank(pct=True)
) * 100

# Ensure no NaNs in label
df_txn['label'] = df_txn['label'].fillna(0)

# Define features
features = [
    'order_count', 'billing_amount', 'margin_amount',
    'nps_score', 'merchant_age_days', 'margin_ratio'
]

# Prepare training data
X = df_txn[features].fillna(0)
y = df_txn['label']

# Train model
model = RandomForestRegressor(n_estimators=500, random_state=5)
model.fit(X, y)

# Save model
joblib.dump(model, "convertway-model.pkl")
print("✅ Model trained and saved as convertway-model.pkl (aligned to data_convertway)")
