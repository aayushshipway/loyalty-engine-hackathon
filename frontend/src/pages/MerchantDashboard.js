import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getLSWithExpiry } from '../helpers';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import '../css/MerchantDashboard.css';

const MerchantDashboard = () => {
  const [merchantName, setMerchantName] = useState('Loading...');
  const [grandStats, setGrandStats] = useState({
    grandScore: null,
    grandBadge: '',
    source: '',
  });
  const [isLoadingGrandStats, setIsLoadingGrandStats] = useState(true);

  const [grandHistory, setGrandHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    setMerchantName('Welcome to Merchant Dashboard');
    const auth = getLSWithExpiry('authKey');
    if (!auth || !auth.email) return;

    const fetchGrandLoyalty = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/merchant/grand-loyalty`,
          { params: { email: auth.email } }
        );

        if (response.data.success) {
          setGrandStats({
            grandScore: response.data.grand_score,
            grandBadge: response.data.grand_badge,
            source: response.data.source,
          });
        }
      } catch (err) {
        console.error('Failed to fetch grand loyalty:', err);
      } finally {
        setIsLoadingGrandStats(false);
      }
    };

    const fetchGrandHistory = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/merchant/grand-loyalty-history`,
          { params: { email: auth.email } }
        );

        if (response.data.success) {
          const formatted = response.data.history.map((entry) => ({
            month: `${entry.month} ${entry.year}`,
            grand_score: entry.grand_score,
          }));
          setGrandHistory(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch grand loyalty history:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchGrandLoyalty();
    fetchGrandHistory();
  }, []);

  return (
    <div className="merchant-dashboard container py-4">
      <h2 className="dashboard-title mb-4">{merchantName}</h2>

      <div className="dashboard-grid">
        <div className="card stat-card highlight-card">
          <h5>Grand Loyalty Score</h5>
          <p>{isLoadingGrandStats ? 'Loading...' : grandStats.grandScore}</p>
        </div>
        <div className="card stat-card badge-card">
          <h5>Badge Awarded</h5>
          <p className={`badge-text badge-${grandStats.grandBadge.toLowerCase()}`}>
            {isLoadingGrandStats ? 'Loading...' : grandStats.grandBadge}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card mt-4 p-4">
        <h5 className="mb-3">Month-wise Grand Score</h5>
        {isLoadingHistory ? (
          <p>Loading history...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={grandHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="grand_score" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default MerchantDashboard;
