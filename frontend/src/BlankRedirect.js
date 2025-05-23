import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLSWithExpiry } from './helpers';

function BlankRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getLSWithExpiry('authKey');
    if (!auth) {
      navigate('/login');
    } else if (auth.type === 'merchant') {
      navigate('/merchant-dashboard');
    } else if (auth.type === 'user') {
      navigate('/user-dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null; // Nothing to render, purely for redirecting
}

export default BlankRedirect;