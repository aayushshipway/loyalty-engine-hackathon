import React, { useEffect, useState } from 'react';
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
import BACKEND_BASE_URL from '../config';

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

  const [merchantId, setMerchantId] = useState(null);

  const getBadgeIcon = (badge) => {
    switch (badge.toLowerCase()) {
      case 'platinum':
        return '🏆'; // Trophy
      case 'gold':
        return '🥇'; // Gold Medal
      case 'silver':
        return '🥈'; // Silver Medal
      default:
        return '';
    }
  };

  useEffect(() => {
    const auth = getLSWithExpiry('authKey');
    if (!auth || !auth.email) return;

    setMerchantName('Welcome to Merchant Dashboard');
    setMerchantId(auth.id);

    const fetchGrandLoyalty = async () => {
      try {
        const res = await fetch(
          `${BACKEND_BASE_URL}/merchant/grand-loyalty?email=${auth.email}`,
          {
            method: 'GET',
            headers: {
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );
        const data = await res.json();
        if (data.success) {
          setGrandStats({
            grandScore: data.grand_score,
            grandBadge: data.grand_badge,
            source: data.source,
          });
          fetchGrandHistory();
        }
      } catch (err) {
        console.error('Error fetching grand loyalty:', err);
      } finally {
        setIsLoadingGrandStats(false);
      }
    };

    const fetchGrandHistory = async () => {
      try {
        const res = await fetch(
          `${BACKEND_BASE_URL}/merchant/grand-loyalty-history?email=${auth.email}`,
          {
            method: 'GET',
            headers: {
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );
        const data = await res.json();
        if (data.success) {
          const formatted = data.history.map((entry) => ({
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
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="dashboard-title mb-4">{merchantName}</h2>
        {merchantId && (
          <div className="merchant-id-text text-muted">
            <strong>My ID:</strong> {merchantId}
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="card stat-card highlight-card">
          <h5>Realtime Grand Loyalty Score</h5>
          <p className={
            isLoadingGrandStats
              ? 'text-center'
              : (grandStats.grandScore === null || grandStats.grandScore === undefined)
                ? ''
                : 'grand-loyalty-score'
          }>
            {isLoadingGrandStats
              ? 'Loading...'
              : (grandStats.grandScore !== null && grandStats.grandScore !== undefined)
                ? grandStats.grandScore
                : 'Not Available'}
          </p>
        </div>
        <div className="card stat-card badge-card">
          <center><h5>Realtime Performance Badge</h5></center>
          <p className={
            isLoadingGrandStats
              ? 'text-center'
              : grandStats.grandBadge
                ? `badge-text badge-${grandStats.grandBadge.toLowerCase()}`
                : ''
          }>
            {isLoadingGrandStats
              ? 'Loading...'
              : grandStats.grandBadge
                ? `${grandStats.grandBadge} ${getBadgeIcon(grandStats.grandBadge)}`
                : 'Not Available'}
          </p>
        </div>
      </div>

      <div className="card mt-4 p-4">
        <h5 className="mb-3">Month on Month Grand Score</h5>
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
