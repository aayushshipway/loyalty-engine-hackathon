import React, { useEffect, useState } from 'react';
import '../css/UserDashboard.css';
import BACKEND_BASE_URL from '../config';

const badgeColors = {
  platinum: '#e5e4e2',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#cd7f32',
};

const UserDashboard = () => {
  const [merchantName, setMerchantName] = useState('Loading...');
  const [topMerchants, setTopMerchants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMerchantName('Welcome to User Dashboard');

    const fetchTopMerchants = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/user/top-grand-loyalty`, {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const data = await res.json();
        if (data.success) {
          setTopMerchants(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch top merchants:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopMerchants();
  }, []);

  return (
    <div className="merchant-dashboard container py-4">
      <h2 className="dashboard-title mb-4">{merchantName}</h2>

      <div className="card p-4">
        <h5 className="mb-3">Top 50 Merchants by Grand Loyalty Score</h5>

        {isLoading ? (
          <p>Loading merchants...</p>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
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
                      <div style={{ position: 'relative', width: '100%' }}>
                        <div
                          style={{
                            height: '10px',
                            width: `${merchant.grand_score}%`,
                            backgroundColor: '#82ca9d',
                            borderRadius: '5px',
                          }}
                        />
                        <span style={{ fontSize: '12px', marginLeft: '8px' }}>
                          {merchant.grand_score}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          backgroundColor: badgeColors[merchant.grand_badge?.toLowerCase()] || '#ccc',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          color: '#000',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textTransform: 'capitalize',
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
    </div>
  );
};

export default UserDashboard;
