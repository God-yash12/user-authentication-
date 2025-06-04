import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import type { LoginRequest } from '../types/auth.types';
import { useNavigate } from 'react-router-dom';
import { tokenUtils } from '../utils/token.utils';

export const useAuthMutations = () => {
    const { login: authLogin, logout: authLogout } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: (credentials: LoginRequest) => authLogin(credentials),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });

            // Role-based redirection
            const userRole = tokenUtils.getUserRole();

            if (userRole === 'admin') {
                navigate('/admin/dashboard');
            } else if (userRole === 'user') {
                navigate('/dashboard');
            } else {
                // Fallback for unknown roles
                navigate('*');
            }
        },
        onError: (error: any) => {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.message || 'Login failed');
        },
    });


    const logoutMutation = useMutation({
        mutationFn: () => Promise.resolve(authLogout()),
        onSuccess: () => {
            queryClient.clear();
            navigate('/login');
        },
    });

    return {
        login: loginMutation,
        logout: logoutMutation,
    };
};