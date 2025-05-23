import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LoginPage.css';
import { setLSWithExpiry } from '../helpers';
import BACKEND_BASE_URL from '../config';

function LoginPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('merchant');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch(
                `${BACKEND_BASE_URL}/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                        type: activeTab,
                    }),
                }
            );
            const data = await res.json();
            if (data.success) {
                const type  = data.type;
                const dataC = data.data;
                const authData = {
                    id: dataC.id,
                    email: dataC.email,
                    type
                };

                setLSWithExpiry('authKey', authData);
                if (type === 'merchant') {
                    navigate('/merchant-dashboard');
                } else {
                    navigate('/user-dashboard');
                }
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2 className="text-center mb-4">Login to Dashboard</h2>

                <div className="tabs">
                    <button
                        className={activeTab === 'merchant' ? 'active' : ''}
                        onClick={() => setActiveTab('merchant')}
                    >
                        Merchant Login
                    </button>
                    <button
                        className={activeTab === 'user' ? 'active' : ''}
                        onClick={() => setActiveTab('user')}
                    >
                        User Login
                    </button>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-btn">Login</button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
