import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginSchema, type LoginFormData } from '../schemas/login.schemas'
import { useAuthMutations } from '../hooks/useAuthMutations';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthMutations();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login.mutateAsync(data);
      
      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || 'Login failed. Please try again.',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register('email')}
          type="email"
          label="Email"
          placeholder="Enter your email"
          error={errors.email?.message}
        />

        <Input
          {...register('password')}
          type="password"
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
        />

        {errors.root && (
          <div className="text-red-600 text-sm text-center">
            {errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={login.isPending}
          disabled={login.isPending}
        >
          {login.isPending ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  );
};