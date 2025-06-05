import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import LoadingSpinner from './LoadingSpinner'; 

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]"> 
        <LoadingSpinner size={48} text="Authenticating..." />
      </div>
    );
  }

  if (!token || !user) {
    // User not logged in, redirect to login page
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // For now, redirecting to their default dashboard based on their actual role
    const defaultDashboard = user.role === 'seeker' ? '/dashboard/seeker' : 
                             user.role === 'employer' ? '/dashboard/employer' : 
                             '/dashboard';
    console.warn(`Access denied: User role "${user.role}" does not match required role "${requiredRole}" for ${location.pathname}. Redirecting to ${defaultDashboard}.`);
    return <Navigate to={defaultDashboard} state={{ from: location }} replace />;
  }

  
  return children;
};

export default PrivateRoute;
