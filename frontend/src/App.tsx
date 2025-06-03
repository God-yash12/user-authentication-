import { Toaster } from 'react-hot-toast'
import { Route, Routes, Navigate } from 'react-router-dom'
import { Dashboard } from './components/Dashboard'
import { RegisterForm } from './components/RegisterForm'
import VerifyOTP from './components/VerifyOTP'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { LoginForm } from './auth/LoginForm'
import { ResetPassword } from './auth/reset-password/reset-password'
import { VerifyOTPForgetPassword } from './auth/reset-password/verify-otp'
import { NewPasswordForm } from './auth/reset-password/new-password'

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<RegisterForm />} />
        <Route path="/VerifyOTP" element={<VerifyOTP />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<LoginForm />} />
        <Route path="*" element={<div>404 Not Found</div>} />
        {/* Optional redirect (make sure it's not duplicating root) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/forgot-password" element={<ResetPassword />} />
        <Route path="/create-newPassword" element={<NewPasswordForm />} />
        <Route path="/verify-otp" element={<VerifyOTPForgetPassword />} />
      </Routes>
    </>
  )
}

export default App
