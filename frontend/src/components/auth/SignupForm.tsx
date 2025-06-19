import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, User, Lock, UserPlus, Check, X } from 'lucide-react';

import { signupSchema, type SignupFormData } from '../../schemas/authSchemas';
import { authService } from '../../lib/auth-api';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

// Password strength checker
const checkPasswordStrength = (password: string, username: string, fullName: string) => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  
  // Check if password contains parts of username or full name
  const containsUsername = Boolean(username && password.toLowerCase().includes(username.toLowerCase()));
  const containsFullName = Boolean(fullName && fullName.split(' ').some(name => 
    name.length > 2 && password.toLowerCase().includes(name.toLowerCase())
  ));
  
  // Calculate strength score
  let score = 0;
  if (hasMinLength) score++;
  if (hasUpperCase) score++;
  if (hasLowerCase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;
  if (!containsUsername && !containsFullName) score++;
  
  return {
    strength: score < 3 ? 'Weak' : score < 5 ? 'Medium' : 'Strong',
    strengthColor: score < 3 ? 'red' : score < 5 ? 'orange' : 'green',
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
    containsUsername,
    containsFullName,
  };
};

export const SignupForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    strength: 'Weak',
    strengthColor: 'red',
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    containsUsername: false,
    containsFullName: false,
  });
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch('password');
  const username = watch('username');
  const fullName = watch('fullName');

  useEffect(() => {
    if (password) {
      setPasswordStrength(checkPasswordStrength(password, username, fullName));
    }
  }, [password, username, fullName]);

  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: (data) => {
      toast.success(data.message);
      navigate('/verify-otp', { 
        state: { 
          userId: data.data.userId, 
          email: data.data.email 
        } 
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      recaptchaRef.current?.reset();
      setRecaptchaToken('');
    },
  });

  const onSubmit = (data: SignupFormData) => {
    // if (!recaptchaToken) {
    //   toast.error('Please complete the reCAPTCHA');
    //   return;
    // }

    signupMutation.mutate({
      ...data,
      recaptchaToken,
    });
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token || '');
    setValue('recaptchaToken', token || '');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('fullName')}
                  type="text"
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('username')}
                  type="text"
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Choose a username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Create a strong password"
                  onFocus={() => setShowPasswordRequirements(true)}
                  onBlur={() => setShowPasswordRequirements(false)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Password Strength Indicator */}
              {showPasswordRequirements && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Password Strength:</span>
                    <span 
                      className={`text-sm font-medium ${
                        passwordStrength.strengthColor === 'red' ? 'text-red-600' :
                        passwordStrength.strengthColor === 'orange' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}
                    >
                      {passwordStrength.strength}
                    </span>
                  </div>
                  
                  <div className="h-1 w-full bg-gray-200 rounded-full mb-3">
                    <div 
                      className={`h-1 rounded-full ${
                        passwordStrength.strengthColor === 'red' ? 'bg-red-500' :
                        passwordStrength.strengthColor === 'orange' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{
                        width: `${(passwordStrength.strength === 'Weak' ? 33 : passwordStrength.strength === 'Medium' ? 66 : 100)}%`
                      }}
                    ></div>
                  </div>
                  
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center">
                      {passwordStrength.hasMinLength ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      At least 8 characters
                    </li>
                    <li className="flex items-center">
                      {passwordStrength.hasUpperCase ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      At least one uppercase letter
                    </li>
                    <li className="flex items-center">
                      {passwordStrength.hasLowerCase ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      At least one lowercase letter
                    </li>
                    <li className="flex items-center">
                      {passwordStrength.hasNumber ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      At least one number
                    </li>
                    <li className="flex items-center">
                      {passwordStrength.hasSpecialChar ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      At least one special character (@$!%*?&)
                    </li>
                    <li className="flex items-center">
                      {!passwordStrength.containsUsername ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      Not contain your username
                    </li>
                    <li className="flex items-center">
                      {!passwordStrength.containsFullName ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      Not contain your name or parts of it
                    </li>
                  </ul>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
              />
            </div>
            {errors.recaptchaToken && (
              <p className="text-sm text-red-600 text-center">{errors.recaptchaToken.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signupMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};