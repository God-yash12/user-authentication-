import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../lib/auth-api';
import { tokenUtils } from '../utils/token.utils';
import type { User, AuthContextType, LoginRequest } from '../types/auth.types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Query to get current user info
  const { data: userInfo, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: !!tokenUtils.getAccessToken(),
    retry: false,
  });

  useEffect(() => {
    if (userInfo?.success && userInfo.data.user) {
      setUser(userInfo.data.user);
      setIsAuthenticated(true);
    } else if (error) {
      setUser(null);
      setIsAuthenticated(false);
      tokenUtils.clearTokens();
    }
  }, [userInfo, error]);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      const response = await authApi.login(credentials);
      
      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Store tokens
        tokenUtils.setTokens(accessToken, refreshToken);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        // Invalidate and refetch user query
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (user?.id) {
        await authApi.logout(user.id);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state regardless of API call success
      tokenUtils.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear();
    }
  };

  const refreshToken = async (): Promise<void> => {
    const refreshToken = tokenUtils.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authApi.refreshToken(refreshToken);
      if (response.success) {
        tokenUtils.setTokens(response.data.accessToken, response.data.refreshToken);
      }
    } catch (error) {
      tokenUtils.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};