import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Use simple user session instead of JWT token
  const user = localStorage.getItem('user');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userData = JSON.parse(user);
  if (!userData.data?.onboardingCompleted && window.location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};

export default ProtectedRoute;