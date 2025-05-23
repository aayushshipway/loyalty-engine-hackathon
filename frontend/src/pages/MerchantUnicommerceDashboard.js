import React, { useEffect, useState } from 'react';
import './../css/MerchantUnicommerceDashboard.css'; // 👈 custom styles
import { getLSWithExpiry } from '../helpers';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import BACKEND_BASE_URL from '../config';

function MerchantUnicommerceDashboard() {
    const [loyaltyScore, setLoyaltyScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    const fetchUnicommerceScores = async () => {
        const auth = getLSWithExpiry('authKey');
        if (!auth || !auth.id) {
            setError('Not authenticated.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(
                `${BACKEND_BASE_URL}/merchant/unicommerce-loyalty?email=${auth.email}`,
                {
                    method: 'GET',
                    headers: {
                        'ngrok-skip-browser-warning': 'true',
                    },
                }
            );
            const data = await res.json();
            if (data.success) {
                setLoyaltyScore(data.loyalty_score_unicommerce);
            } else {
                setError('Failed to load unicommerce scores.');
            }
        } catch (err) {
            setError('Server error while loading scores.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnicommerceHistory = async () => {
        const auth = getLSWithExpiry('authKey');
        if (!auth || !auth.email) return;

        try {
            const res = await fetch(
                `${BACKEND_BASE_URL}/merchant/unicommerce-loyalty-history?email=${auth.email}`,
                {
                    method: 'GET',
                    headers: {
                        'ngrok-skip-browser-warning': 'true',
                    },
                }
            );

            const data = await res.json();
            if (data.success) {
                const formatted = data.history.map(entry => ({
                    month: `${entry.month} ${entry.year}`,
                    score: entry.loyalty_score_unicommerce
                }));
                setHistoryData(formatted);
            }
        } catch (err) {
            console.error('Error fetching Unicommerce loyalty history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchUnicommerceScores();
        fetchUnicommerceHistory();
    }, []);

    return (
        <div className="unicommerce-dashboard container">
            <h2 className="dashboard-title">My Unicommerce Loyalty</h2>

            {loading ? (
                <div className="status-message">Loading...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="card-metrics mb-4">
                    <div className="metric-card">
                        <h4>Loyalty Score</h4>
                        <p className="metric-value">{loyaltyScore}</p>
                    </div>
                    {/* You can add more cards here for churnRate etc. */}
                </div>
            )}

            {/* Month-on-Month Graph Block */}
            <div className="graph-section card p-4">
                <h5 className="mb-3">Month-on-Month Loyalty Score</h5>
                {historyLoading ? (
                    <p>Loading graph...</p>
                ) : historyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p>No historical data available</p>
                )}
            </div>
        </div>
    );
}

export default MerchantUnicommerceDashboard;