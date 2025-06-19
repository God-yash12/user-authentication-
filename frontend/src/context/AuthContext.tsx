import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User } from '../types/auth.types';
import { TokenService } from '../services/tokenService';
import { authService } from '../lib/auth-api';
import { toast } from 'react-hot-toast';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, expiresIn: number, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && TokenService.hasValidToken();

  const login = (accessToken: string, refreshToken: string, expiresIn: number, userData: User) => {
    TokenService.setTokens(accessToken, refreshToken, expiresIn);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore logout API errors
    } finally {
      TokenService.clearTokens();
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const checkAuth = async () => {
    try {
      if (TokenService.hasValidToken()) {
        const response = await authService.getProfile();
        if (response.success) {
          setUser(response.data);
        } else {
          TokenService.clearTokens();
        }
      }
    } catch (error) {
      TokenService.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};