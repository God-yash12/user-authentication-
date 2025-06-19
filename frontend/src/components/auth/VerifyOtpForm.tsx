import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Key } from 'lucide-react';

import { verifyOtpSchema, type VerifyOtpFormData } from '../../schemas/authSchemas';
import { authService } from '../../lib/auth-api';

export const VerifyOtpForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, email } = location.state || {};

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      userId: userId || '',
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: (data) => {
      toast.success(data.message);
      navigate('/login');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'OTP verification failed';
      toast.error(message);
    },
  });

  const onSubmit = (data: VerifyOtpFormData) => {
    verifyOtpMutation.mutate(data);
  };

  if (!userId || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invalid Verification Link
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please start the signup process again.
            </p>
            <div className="mt-6">
              <a
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Go to Signup
              </a>
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
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Key className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a 6-digit code to{' '}
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('userId')} />
          
          <div className="space-y-4">
            {/* OTP Code */}
            <div>
              <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('otpCode')}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter 6-digit code"
                />
              </div>
              {errors.otpCode && (
                <p className="mt-1 text-sm text-red-600">{errors.otpCode.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={verifyOtpMutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyOtpMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};