import React, { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { type RegistrationFormData, registrationFormSchema, PasswordStrengthLevel, type PasswordStrengthResult } from '../types';
import { registerUser } from '../services/authService';
import { calculatePasswordStrength } from '../utils/passwordStrength';
import { CAPTCHA_LENGTH } from '../constants';

import Input from './ui/Input';
import Button from './ui/Button';
import Alert from './ui/Alert';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import CaptchaChallenge from './CaptchaChallenge';


// Icons (simple SVGs)
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.929 7.071a1 1 0 011.414 0L10 12.586l5.657-5.515a1 1 0 111.414 1.414l-6.364 6.22a1 1 0 01-1.414 0L2.929 8.485a1 1 0 010-1.414z" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>;


const generateCaptchaString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const initialPasswordStrength = calculatePasswordStrength('', '');

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [captchaText, setCaptchaText] = useState(generateCaptchaString(CAPTCHA_LENGTH));
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult>(initialPasswordStrength);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setError: setFormError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      captchaInput: '',
    },
  });

  const passwordValue = watch('password');
  const usernameValue = watch('username');

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(passwordValue || '', usernameValue || ''));
  }, [passwordValue, usernameValue]);

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data.success && data.user) {
        navigate('/dashboard', { state: { username: data.user.username } });
      } else {
        setApiError(data.message || "Registration failed. Please try again.");
      }
    },
    onError: (error: Error) => {
      setApiError(error.message || "An unexpected error occurred.");
    },
  });

  const onSubmit: SubmitHandler<RegistrationFormData> = (data) => {
    setApiError(null); // Clear previous API errors
    if (data.captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
      setFormError('captchaInput', { type: 'manual', message: 'CAPTCHA does not match. Please try again.' });
      regenerateCaptcha();
      return;
    }
    // Final check if password strength is too low (e.g. contains username but Zod check passed for length)
    const currentStrength = calculatePasswordStrength(data.password, data.username);
    if (currentStrength.level === PasswordStrengthLevel.VERY_WEAK || 
        currentStrength.requirements.find(r => r.id === 'notUsername' && !r.met)
    ) {
      setFormError('password', { type: 'manual', message: 'Password is too weak or contains your username.' });
      return;
    }
    mutation.mutate(data);
  };

  const regenerateCaptcha = useCallback(() => {
    setCaptchaText(generateCaptchaString(CAPTCHA_LENGTH));
  }, []);
  
  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8 bg-white shadow-2xl rounded-xl w-full max-w-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Create Account</h2>

      {apiError && (
        <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
      )}

      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <Input {...field} label="Username" id="username" placeholder="Choose a username" error={errors.username?.message} icon={<UserIcon />} />
        )}
      />

      <div>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <Input
                {...field}
                label="Password"
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                error={errors.password?.message}
                icon={<LockIcon />}
                aria-describedby="password-strength-meter"
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          )}
        />
        {(passwordValue && passwordValue.length > 0) || usernameValue && passwordValue ? ( // Show meter if password has input or if username has input and password also has input
          <div id="password-strength-meter" aria-live="polite">
            <PasswordStrengthMeter 
              level={passwordStrength.level} 
              suggestions={passwordStrength.suggestions}
              requirements={passwordStrength.requirements}
            />
          </div>
        ): null}
      </div>

      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <Input {...field} label="Confirm Password" id="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Re-enter your password" error={errors.confirmPassword?.message} icon={<LockIcon />} />
        )}
      />

      <div className="space-y-2">
        <label htmlFor="captchaInput" className="block text-sm font-medium text-gray-700">
          Security Check
        </label>
        <CaptchaChallenge captchaText={captchaText} onRefresh={regenerateCaptcha} />
        <Controller
          name="captchaInput"
          control={control}
          render={({ field }) => (
            <Input {...field} id="captchaInput" placeholder="Enter characters above" error={errors.captchaInput?.message} icon={<ShieldIcon />} />
          )}
        />
      </div>

      <Button type="submit" className="w-full" isLoading={mutation.isPending} variant="primary">
        Register Account
      </Button>

      <p className="text-xs text-center text-gray-500">
        By registering, you agree to our (non-existent) Terms of Service.
      </p>
    </form>
  );
};

export default RegistrationForm;