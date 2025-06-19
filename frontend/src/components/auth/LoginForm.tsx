import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Lock, User, Loader2 } from 'lucide-react';

import { loginSchema, type LoginFormData } from '../../schemas/authSchemas';
import { authService } from '../../lib/auth-api';
import { useAuth } from '../../context/AuthContext';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Check for redirect state (e.g., after signup)
  const from = location.state?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Handle account lockout
  useEffect(() => {
    if (loginAttempts >= 5) {
      const lockDuration = 15 * 60 * 1000; // 15 minutes
      setIsLocked(true);
      setLockTime(Date.now() + lockDuration);

      const timer = setInterval(() => {
        const remainingTime = lockTime - Date.now();
        if (remainingTime <= 0) {
          setIsLocked(false);
          setLoginAttempts(0);
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loginAttempts, lockTime]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      const { user, accessToken, refreshToken, expiresIn } = data.data;
      login(accessToken, refreshToken, expiresIn, user);
      toast.success(data.message);

      // Role-based redirection
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/user/dashboard', { replace: true });
        }
      }
    },
    onError: (error: any) => {
      // Handle different error cases
      if (error.response?.status === 401) {
        const message = error.response?.data?.message || 'Invalid credentials';
        toast.error(message);
        setLoginAttempts(prev => prev + 1);

        // Clear password field on error
        reset({ password: '' });

        // Specific error cases
        if (message.includes('Email not verified')) {
          setError('identifier', {
            type: 'manual',
            message: 'Please verify your email first',
          });
        }
      } else if (error.response?.status === 403) {
        toast.error(error.response?.data?.message || 'Account is locked');
        setIsLocked(true);

      } else if (error.response?.status === 429) {
        toast.error('Too many login attempts. Please try again later.');
      } else {
        toast.error(error.message || 'Login failed');
      }

      // Reset reCAPTCHA
      recaptchaRef.current?.reset();
      setRecaptchaToken('');
    },
  });

  const onSubmit = (data: LoginFormData) => {
    // if (!recaptchaToken) {
    //   toast.error('Please complete the reCAPTCHA');
    //   return;
    // }

    if (isLocked) {
      toast.error(`Account locked. Try again in ${Math.ceil((lockTime - Date.now()) / (60 * 1000))} minutes.`);
      return;
    }

    loginMutation.mutate({
      ...data,
      recaptchaToken,
    });
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token || '');
    setValue('recaptchaToken', token || '');
  };

  // Format remaining lock time
  const formatLockTime = () => {
    const remainingSeconds = Math.ceil((lockTime - Date.now()) / 1000);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Account lock warning */}
        {isLocked && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Too many failed attempts. Account locked for {formatLockTime()} minutes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Failed attempt warning */}
        {loginAttempts > 0 && loginAttempts < 5 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {5 - loginAttempts} attempt{loginAttempts === 4 ? '' : 's'} remaining before account is locked.
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email or Username */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Email or Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('identifier')}
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  disabled={isLocked || loginMutation.isPending}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-2 border ${errors.identifier ? 'border-red-300' : 'border-gray-300'} rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isLocked ? 'bg-gray-100' : ''}`}
                  placeholder="Enter your email or username"
                />
              </div>
              {errors.identifier && (
                <p className="mt-1 text-sm text-red-600">{errors.identifier.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isLocked || loginMutation.isPending}
                  className={`appearance-none relative block w-full pl-10 pr-10 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isLocked ? 'bg-gray-100' : ''}`}
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLocked || loginMutation.isPending}
                    className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me checkbox (optional) */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                disabled={isLocked || loginMutation.isPending}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
                onExpired={() => setRecaptchaToken('')}
                onErrored={() => toast.error('reCAPTCHA verification failed')}
              />
            </div>
            {errors.recaptchaToken && (
              <p className="text-sm text-red-600 text-center">{errors.recaptchaToken.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLocked || loginMutation.isPending}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLocked ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LogIn
                      className={`h-5 w-5 ${isLocked ? 'text-gray-300' : 'text-blue-500 group-hover:text-blue-400'}`}
                    />
                  </span>
                  Sign in
                </>
              )}
            </button>
          </div>
        </form>

        {/* Social login options (optional) */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div>
              <button
                type="button"
                disabled={isLocked}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Sign in with Google</span>
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
              </button>
            </div>

            <div>
              <button
                type="button"
                disabled={isLocked}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Sign in with GitHub</span>
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};