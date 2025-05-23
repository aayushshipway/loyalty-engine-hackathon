import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './../css/MerchantShipwayDashboard.css'; // 👈 custom styles
import { getLSWithExpiry } from '../helpers';

function MerchantShipwayDashboard() {
  const [loyaltyScore, setLoyaltyScore] = useState(null);
  const [churnRate, setChurnRate] = useState(null);
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchShipwayScores = async () => {
    const auth = getLSWithExpiry('authKey');
    if (!auth || !auth.id) {
      setError('Not authenticated.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/merchant/shipway-loyalty`,
        {
          params: { email: auth.email },
        }
      );

      if (response.data.success) {
        setLoyaltyScore(response.data.loyalty_score_shipway);
        setChurnRate(response.data.churn_rate_shipway);
        setSource(response.data.source);
      } else {
        setError('Failed to load shipway scores.');
      }
    } catch (err) {
      setError('Server error while loading scores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipwayScores();
  }, []);

  return (
    <div className="shipway-dashboard container">
      <h2 className="dashboard-title">My Shipway Loyalty</h2>

      {loading ? (
        <div className="status-message">Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="card-metrics">
          <div className="metric-card">
            <h4>Loyalty Score</h4>
            <p className="metric-value">{loyaltyScore}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MerchantShipwayDashboard;
