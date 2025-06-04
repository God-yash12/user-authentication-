// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
// import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   requireEmailVerification?: boolean;
// }

// export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
//   children, 
//   requireEmailVerification = false 
// }) => {
//   const { isAuthenticated, isLoading, user } = useAuth();
//   const location = useLocation();

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   if (requireEmailVerification && user && !user.isEmailVerified) {
//     return <Navigate to="/verify-email" replace />;
//   }

//   return <>{children}</>;
// };



import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';


interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, isLoading, isAdmin, isUser } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based redirection
  if (requiredRole === 'admin' && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole === 'user' && !isUser()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};