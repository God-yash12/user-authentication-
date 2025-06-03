import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { loginSchema, type LoginFormData } from '../schemas/login.schemas'
import { useAuthMutations } from '../hooks/useAuthMutations';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import ReCAPTCHA from 'react-google-recaptcha';


export const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuthMutations();
    const [showPassword, setShowPassword] = useState(false);


    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    const onCaptchaChange = (token: string | null) => {
        setCaptchaToken(token);
    };


    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const onSubmit = async (data: LoginFormData) => {
        try {
            if (!captchaToken) {
                setError('root', {
                    type: 'manual',
                    message: 'Please complete the reCAPTCHA verification.',
                });
                return;
            }
            await login.mutateAsync({ ...data, recaptchaToken: captchaToken });

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

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    const handleSignUp = () => {
        navigate('/');
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

                <div className="relative">
                    <Input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        placeholder="Enter your password"
                        error={errors.password?.message}
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        {showPassword ? (
                            <EyeOff size={20} />
                        ) : (
                            <Eye size={20} />
                        )}
                    </button>
                </div>

                {errors.root && (
                    <div className="text-red-600 text-sm text-center">
                        {errors.root.message}
                    </div>
                )}

                <div className="flex justify-start mt-4">
                    <ReCAPTCHA
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                        onChange={onCaptchaChange}
                    />
                </div>



                <Button
                    type="submit"
                    className="w-full"
                    isLoading={login.isPending}
                    disabled={login.isPending}
                >
                    {login.isPending ? 'Logging in...' : 'Login'}
                </Button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                    >
                        Forgot Password?
                    </button>
                </div>

                <div className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={handleSignUp}
                        className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none font-medium"
                    >
                        Sign up now
                    </button>
                </div>
            </form>
        </div>
    );
};