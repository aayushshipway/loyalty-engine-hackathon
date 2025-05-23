import React from 'react';
import { Navigate } from 'react-router-dom';
import { getLSWithExpiry } from './helpers';

const PrivateRoute = ({ children, requiredType }) => {
  const auth = getLSWithExpiry('authKey');

  if (!auth) {
    return <Navigate to="/login" />;
  }

  if (requiredType && auth.type !== requiredType) {
    // Unauthorized role trying to access a restricted page
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
