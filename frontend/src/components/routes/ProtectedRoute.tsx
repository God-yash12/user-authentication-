import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-hot-toast';

interface ProtectedRouteProps {
  roles?: ('admin' | 'user')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role as 'admin' | 'user')) {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};