import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { AuthLayout } from './layouts/AuthLayout';
import { LoginForm } from './components/auth/LoginForm';
import { VerifyOtpForm } from './components/auth/VerifyOtpForm';
import { Dashboard } from './components/Dashboard';
import AdminDashboard from './admin/Dashboard';
import { RequestOtpForm } from './components/reset-password/reset-password';
import { VerifyResetOtpForm } from './components/reset-password/verify-otp';
import { ResetPasswordForm } from './components/reset-password/new-password';
import TravelAgencyLanding from './components/landingPage';

export const App: React.FC = () => {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<TravelAgencyLanding />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/verify-otp" element={<VerifyOtpForm />} />
          <Route path="/forgot-password" element={<RequestOtpForm />} />
          <Route path="/verify-reset-otp" element={<VerifyResetOtpForm />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />

          {/* User Dashboard */}
          <Route element={<ProtectedRoute roles={['user']} />}>
            <Route element={<AuthLayout />}>
              <Route path="/user/dashboard" element={<Dashboard />} />
            </Route>
          </Route>

          {/* Admin Dashboard */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<AuthLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
      <Toaster position="top-center" />
    </>
  );
};
