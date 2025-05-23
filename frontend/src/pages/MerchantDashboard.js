import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getLSWithExpiry } from '../helpers';
import '../css/MerchantDashboard.css';

const MerchantDashboard = () => {
  const [merchantName, setMerchantName] = useState('Loading...');

  const [grandStats, setGrandStats] = useState({
    grandScore: null,
    grandBadge: '',
    source: '',
  });

  const [isLoadingGrandStats, setIsLoadingGrandStats] = useState(true);

  useEffect(() => {
    setMerchantName('Welcome to Merchant Dashboard');
    const fetchGrandLoyalty = async () => {
      const auth = getLSWithExpiry('authKey');
      if (!auth || !auth.email) return;

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

    fetchGrandLoyalty();
  }, []);

  return (
    <div className="merchant-dashboard container py-4">
      <h2 className="dashboard-title mb-4">{merchantName}</h2>

      <div className="dashboard-grid">

        {/* Grand Stats */}
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
    </div>
  );
};

export default MerchantDashboard;
