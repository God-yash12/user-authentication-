import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Key, ArrowRight } from 'lucide-react';

import { verifyOtpSchemaForgetPassword, type VerifyOtpFormDataForgetPassword } from '../../schemas/reset-password-schema';
import { authService } from '../../lib/auth-api';

export const VerifyResetOtpForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpFormDataForgetPassword>({
    resolver: zodResolver(verifyOtpSchemaForgetPassword),
    defaultValues: {
      email: email || '',
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: VerifyOtpFormDataForgetPassword) => 
      authService.verifyOTP(data.email, data.otp),
    onSuccess: (data) => {
      toast.success(data.message);
      navigate('/reset-password', { state: { email } });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'OTP verification failed';
      toast.error(message);
    },
  });

  const onSubmit = (data: VerifyOtpFormDataForgetPassword) => {
    verifyOtpMutation.mutate(data);
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invalid Request
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please start the password reset process again.
            </p>
            <div className="mt-6">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Reset Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a 6-digit code to{' '}
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('email')} />
          
          <div className="space-y-4">
            {/* OTP Code */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('otp')}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter 6-digit code"
                />
              </div>
              {errors.otp && (
                <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={verifyOtpMutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {verifyOtpMutation.isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <ArrowRight className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                  </span>
                  Verify Code
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="font-medium text-blue-600 hover:text-blue-500 text-sm"
            >
              Didn't receive code? Try again
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};