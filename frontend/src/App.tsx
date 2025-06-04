import { Toaster } from 'react-hot-toast'
import { Route, Routes } from 'react-router-dom'
import { Dashboard } from './components/Dashboard'
import { RegisterForm } from './components/RegisterForm'
import VerifyOTP from './components/VerifyOTP'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { LoginForm } from './auth/LoginForm'
import { ResetPassword } from './auth/reset-password/reset-password'
import { VerifyOTPForgetPassword } from './auth/reset-password/verify-otp'
import { NewPasswordForm } from './auth/reset-password/new-password'
import AdminDashboard from './admin/Dashboard'

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<RegisterForm />} />
        <Route path="/VerifyOTP" element={<VerifyOTP />} />
        <Route path="/login" element={<LoginForm />} />
        
        {/* User dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="user">
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Admin dashboard */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard /> {/* You'll need to create this component */}
          </ProtectedRoute>
        } />
        
        {/* Other routes */}
        <Route path="/forgot-password" element={<ResetPassword />} />
        <Route path="/create-newPassword" element={<NewPasswordForm />} />
        <Route path="/verify-otp" element={<VerifyOTPForgetPassword />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </>
  );
}
export default App
