import React, { useEffect, useState } from 'react';
import './../css/UserShipwayDashboard.css';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import BACKEND_BASE_URL from '../config';

function UserShipwayDashboard() {
  const [topMerchants, setTopMerchants] = useState([]);
  const [avgLoyalHighChurnMerchants, setAvgLoyalHighChurnMerchants] = useState([]);

  const fetchTopMerchants = async () => {
    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}/user/shipway-high-loyalty-churn`,
        {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        setTopMerchants(data.data);
      }
    } catch (err) {
      console.error('Error fetching top merchants:', err);
    }
  };

  const fetchAvgLoyalHighChurnMerchants = async () => {
    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}/user/shipway-average-loyalty-high-churn`,
        {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        setAvgLoyalHighChurnMerchants(data.data);
      }
    } catch (err) {
      console.error('Error fetching average-loyal high-churn merchants:', err);
    }
  };

  useEffect(() => {
    fetchTopMerchants();
    fetchAvgLoyalHighChurnMerchants();
  }, []);

  return (
    <div className="shipway-dashboard container">
      <h2 className="dashboard-title">Shipway Summary</h2>

      {/* Graph 1: High Loyalty + High Churn */}
      <div className="graph-section card p-4 mt-4">
        <h5 className="mb-3">At Risk - Most Valuable Merchants</h5>
        {topMerchants.length > 0 ? (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={topMerchants}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="merchant_id" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="loyalty_score_shipway" fill="#8884d8" name="Loyalty Score" />
              <Bar dataKey="churn_rate_shipway" fill="#82ca9d" name="Churn Rate" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>Loading merchant comparison chart...</p>
        )}
      </div>

      {/* Graph 2: Average Loyalty + High Churn */}
      <div className="graph-section card p-4 mt-4">
        <h5 className="mb-3">At Risk - Average Loyal Merchants</h5>
        {avgLoyalHighChurnMerchants.length > 0 ? (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={avgLoyalHighChurnMerchants}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="merchant_id" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="loyalty_score_shipway" fill="#ffc658" name="Loyalty Score" />
              <Bar dataKey="churn_rate_shipway" fill="#ff7300" name="Churn Rate" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>Loading average-loyal merchant chart...</p>
        )}
      </div>
    </div>
  );
}

export default UserShipwayDashboard;
