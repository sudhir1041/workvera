import React from 'react';
import { useAuth } from '../contexts/AuthContext'; 
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner'; 
import { LayoutDashboard } from 'lucide-react';

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth(); 

  if (authLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
        <LoadingSpinner size={48} text="Loading Dashboard..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  
  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-xl">
      <div className="flex items-center mb-6">
        <LayoutDashboard className="w-10 h-10 text-blue-600 mr-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Dashboard</h1>
      </div>
      <p className="text-lg text-gray-700 mb-2">
        Welcome back, <span className="font-semibold">{user.name || user.email}</span>!
      </p>
      <p className="text-gray-600">
        Your current role is: <span className="font-medium capitalize text-indigo-600">{user.role}</span>.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        You are viewing the generic dashboard. If you have a role-specific dashboard (Seeker or Employer), 
        you should have been redirected there.
      </p>
      
    </div>
  );
};

export default DashboardPage;
