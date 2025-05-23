import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MerchantDashboard from './pages/MerchantDashboard';
import MerchantShipwayDashboard from './pages/MerchantShipwayDashboard';
import UserDashboard from './pages/UserDashboard';
import { getLSWithExpiry } from './helpers';
import PrivateRoute from './PrivateRoute';
import BlankRedirect from './BlankRedirect';
import NotFoundPage from './NotFoundPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Navbar.css';
import './App.css';

function Navbar() {
  const navigate = useNavigate();
  const authUser = getLSWithExpiry('authKey');

  const handleLogout = () => {
    //localStorage.removeItem('authKey');
    localStorage.clear();
    navigate('/login');
  };

  const renderNavLinks = () => {
    if (!authUser) return null;
    switch (authUser.type) {
      case 'merchant':
        return (
          <>
            <NavLink to="/merchant-dashboard" className="nav-link">Dashboard</NavLink>
            <NavLink to="/merchant-shipway-dashboard" className="nav-link">Shipway</NavLink>
            <NavLink to="/merchant-convertway-dashboard" className="nav-link">Convertway</NavLink>
            <NavLink to="/merchant-unicommerce-dashboard" className="nav-link">Unicommerce</NavLink>
          </>
        );
      case 'user':
        return (
          <>
            <NavLink to="/user-dashboard" className="nav-link">Dashboard</NavLink>
            <NavLink to="/rewards" className="nav-link">Rewards</NavLink>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="navbar navbar-expand-lg px-3">
      <NavLink to="/" className="navbar-brand d-flex align-items-center">
        <img src="" alt="Logo" height="36" className="me-2" />
        <span>Merchant Loyalty Engine</span>
      </NavLink>

      {authUser && (
        <>
          <div className="navbar-nav">{renderNavLinks()}</div>
          <div className="ms-auto d-flex align-items-center">
            <button className="btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-light text-center text-muted py-3 border-top">
      <div className="container">
        <small>&copy; {new Date().getFullYear()} Merchant Loyalty Engine • All rights reserved</small>
      </div>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<BlankRedirect />} /> {/* 👈 Add this */}
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/merchant-dashboard"
              element={
                <PrivateRoute requiredType="merchant">
                  <MerchantDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/merchant-shipway-dashboard"
              element={
                <PrivateRoute requiredType="merchant">
                  <MerchantShipwayDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/merchant-convertway-dashboard"
              element={
                <PrivateRoute requiredType="merchant">
                  <MerchantShipwayDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/merchant-unicommerce-dashboard"
              element={
                <PrivateRoute requiredType="merchant">
                  <MerchantShipwayDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/user-dashboard"
              element={
                <PrivateRoute requiredType="user">
                  <UserDashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
