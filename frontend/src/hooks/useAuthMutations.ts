import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import type { LoginRequest } from '../types/auth.types';
import { useNavigate } from 'react-router-dom';

export const useAuthMutations = () => {
    const { login: authLogin, logout: authLogout } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: (credentials: LoginRequest) => authLogin(credentials),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            navigate('/dashboard');
        },
        onError: (error: any) => {
            console.error('Login error:', error);
            // Handle specific error cases if needed
            throw new Error(error.response?.data?.message || 'Login failed');
        },
    });

    const logoutMutation = useMutation({
        mutationFn: () => Promise.resolve(authLogout()),
        onSuccess: () => {
            queryClient.clear();
        },
    });

    return {
        login: loginMutation,
        logout: logoutMutation,
    };
};