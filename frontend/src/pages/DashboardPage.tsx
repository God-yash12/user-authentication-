
import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const username = location.state?.username;

  if (!username) {
    // If no username in state, redirect to registration (e.g., direct access to /dashboard)
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-lg p-10 max-w-md w-full text-center">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {username}!</h1>
        <p className="text-gray-600 mb-8">
          You have successfully registered and are now on your dashboard.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This is a placeholder dashboard. In a real application, you'd find your user-specific content and features here.
        </p>
        <Link to="/register">
          <Button variant="outline">
            Back to Registration (Logout simulation)
          </Button>
        </Link>
      </div>
      <footer className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          SecureApp Dashboard &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default DashboardPage;
    