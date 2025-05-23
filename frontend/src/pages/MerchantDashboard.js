import React, { useEffect, useState } from 'react';
import '../css/MerchantDashboard.css';

const MerchantDashboard = () => {
  const [merchantName, setMerchantName] = useState('Loading...');
  const [loyaltyStats, setLoyaltyStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    averageScore: 0,
    rewardsGiven: 0,
  });

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setMerchantName('Welcome to Merchant Dashboard');
      setLoyaltyStats({
        totalUsers: 1280,
        activeUsers: 674,
        averageScore: 78,
        rewardsGiven: 4320,
      });
    }, 800);
  }, []);

  return (
    <div className="merchant-dashboard container py-4">
      <h2 className="dashboard-title mb-4">Welcome, {merchantName}</h2>
      <div className="dashboard-grid">
        <div className="card stat-card">
          <h5>Total Users</h5>
          <p>{loyaltyStats.totalUsers}</p>
        </div>
        <div className="card stat-card">
          <h5>Active Users</h5>
          <p>{loyaltyStats.activeUsers}</p>
        </div>
        <div className="card stat-card">
          <h5>Avg. Loyalty Score</h5>
          <p>{loyaltyStats.averageScore}</p>
        </div>
        <div className="card stat-card">
          <h5>Rewards Given</h5>
          <p>{loyaltyStats.rewardsGiven}</p>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
