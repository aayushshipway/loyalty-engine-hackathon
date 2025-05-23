import pandas as pd
import joblib
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
import pymysql
from dotenv import load_dotenv
import os
from urllib.parse import quote_plus
from sqlalchemy import create_engine  # ✅ UNCOMMENTED

# Load environment variables
load_dotenv()

# Database connection
host = os.getenv("DB_HOST")
user = os.getenv("DB_USER")
password = quote_plus(os.getenv("DB_PASSWORD", ""))
database = os.getenv("DB_NAME")

connection_str = f"mysql+pymysql://{user}:{password}@{host}/{database}"
engine = create_engine(connection_str)

# SQL query
query = """
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

# Load data
df = pd.read_sql(query, engine)

# Cleanup engine
engine.dispose()

# Convert registration date to datetime
df['register_convertway'] = pd.to_datetime(df['register_convertway'], errors='coerce')

# Feature engineering
df['merchant_age_days'] = (pd.Timestamp.now() - df['register_convertway']).dt.days
df['margin_ratio'] = df['margin_amount'] / df['billing_amount'].replace(0, 1)

# Churn risk score (weighted rank-based heuristic)
df['churn_risk'] = (
    0.30 * df['order_count'].rank(pct=True) +
    0.25 * df['margin_ratio'].rank(pct=True) +
    0.20 * df['nps_score'].rank(pct=True) +
    0.15 * df['merchant_age_days'].rank(pct=True) +
    0.10 * df['margin_amount'].rank(pct=True)
) * 100

# Feature set
features = [
    'merchant_age_days',
    'order_count',
    'margin_ratio',
    'billing_amount',
    'margin_amount',
    'nps_score'
]

# Drop rows with missing data in features or label
df.dropna(subset=features + ['churn_risk'], inplace=True)

# Prepare training data
X = df[features]
y = df['churn_risk']

# Train Random Forest Regressor
model = RandomForestRegressor(n_estimators=500, random_state=42, n_jobs=-1)
model.fit(X, y)

# Save model to disk
joblib.dump(model, "convertway_churn_model.pkl")
print("Churn model trained and saved as convertway_churn_model.pkl")
