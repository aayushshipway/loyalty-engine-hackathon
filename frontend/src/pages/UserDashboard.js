import React, { useEffect, useState } from 'react';
import '../css/UserDashboard.css';
import BACKEND_BASE_URL from '../config';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Bar,
  LabelList,
} from 'recharts';

import unicommerceLogo from '../unicommerce.png';
import shipwayLogo from '../shipway.webp';
import convertwayLogo from '../convertway.webp';

const badgeColors = {
  platinum: '#e5e4e2',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#cd7f32',
};

const UserDashboard = () => {
  const [merchantName, setMerchantName] = useState('Loading...');
  const [topMerchants, setTopMerchants] = useState([]);
  const [shipwayTop, setShipwayTop] = useState([]);
  const [convertwayTop, setConvertwayTop] = useState([]);
  const [unicommerceTop, setUnicommerceTop] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMerchantName('Welcome to User Dashboard');

    const fetchTopMerchants = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/user/top-grand-loyalty`,{headers:{
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                    }});
        const data = await res.json();
        if (data.success) setTopMerchants(data.data);
      } catch (err) {
        console.error('Failed to fetch top merchants:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTopData = async (url, setter) => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}${url}`,{headers:{
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                    }});
        const data = await res.json();
        if (data.success) setter(data.data);
      } catch (err) {
        console.error(`Failed to fetch from ${url}`, err);
      }
    };

    fetchTopMerchants();
    fetchTopData('/user/shipway-top-merchants', setShipwayTop);
    fetchTopData('/user/convertway-top-merchants', setConvertwayTop);
    fetchTopData('/user/unicommerce-top-merchants', setUnicommerceTop);
  }, []);

  const renderTopPerformerChart = (title, data, loyaltyKey, ordersKey, billingKey, logo) => (
    <div className="chart-card">
      <div className="card shadow-sm p-3 animated fade-in text-center">
        <img src={logo} alt={`${title} logo`} style={{ width: '20%', marginBottom: 10, marginLeft: '40%' }} />
        <h5 className="mb-3">{title} <b>Top Performers</b></h5>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={[...data].sort((a, b) => b[loyaltyKey] - a[loyaltyKey])}
            layout="vertical"
            margin={{ top: 20, right: 20, left: 80, bottom: 20 }}
          >
            <CartesianGrid stroke="#f0f0f0" />
            <XAxis type="number" />
            <YAxis dataKey="merchant_id" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey={loyaltyKey} barSize={12} fill="#8884d8" name="Loyalty Score">
              <LabelList dataKey={loyaltyKey} position="right" />
            </Bar>
            <Bar dataKey={ordersKey} barSize={12} fill="#82ca9d" name="Total Orders">
              <LabelList dataKey={ordersKey} position="right" />
            </Bar>
            <Bar dataKey={billingKey} barSize={12} fill="#ffc658" name="Total Billing">
              <LabelList dataKey={billingKey} position="right" formatter={(val) => `₹${val}`} />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="merchant-dashboard container py-4 animated slide-in">
      <h2 className="dashboard-title mb-4">{merchantName}</h2>

      <div className="card shadow-sm p-4 mb-4 animated fade-in">
        <h5 className="mb-3">Top 10 Merchants by Grand Loyalty Score</h5>
        {isLoading ? (
          <p>Loading merchants...</p>
        ) : (
          <div className="scroll-table">
            <table className="merchant-table">
              <thead>
                <tr>
                  <th>Merchant ID</th>
                  <th>Grand Score</th>
                  <th>Badge</th>
                </tr>
              </thead>
              <tbody>
                {topMerchants.map((merchant) => (
                  <tr key={merchant.merchant_id}>
                    <td>{merchant.merchant_id}</td>
                    <td>
                      <div className="score-bar">
                        <div
                          className="score-fill"
                          style={{ width: `${merchant.grand_score}%` }}
                        />
                        <span>{merchant.grand_score}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor:
                            badgeColors[merchant.grand_badge?.toLowerCase()] || '#ccc',
                        }}
                      >
                        {merchant.grand_badge}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="chart-row">
        {renderTopPerformerChart('Shipway', shipwayTop, 'loyalty_score_shipway', 'total_orders', 'total_billing', shipwayLogo)}
        {renderTopPerformerChart('Convertway', convertwayTop, 'loyalty_score_convertway', 'total_orders', 'total_billing', convertwayLogo)}
        {renderTopPerformerChart('Unicommerce', unicommerceTop, 'loyalty_score_unicommerce', 'total_orders', 'total_billing', unicommerceLogo)}
      </div>
    </div>
  );
};

export default UserDashboard;
