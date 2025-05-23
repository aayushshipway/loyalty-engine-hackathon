import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/LoginPage.css';
import { setLSWithExpiry } from '../helpers';

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
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/login`, {
                email,
                password,
                type: activeTab,
            });
            if (response.data.success) {
                const { data, type } = response.data;
                const authData = {
                    id: data.id,
                    email: data.email,
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
