// src/api/authApi.ts
import axios from './axios';
import { SignupFormData, LoginFormData, VerificationFormData } from '../schemas/authSchemas';

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
  };
}

export interface VerificationResponse {
  success: boolean;
  message: string;
}

export const authApi = {
  // Register a new user
  signup: async (userData: SignupFormData): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/auth/signup', userData);
    return response.data;
  },

  // Login an existing user
  login: async (credentials: LoginFormData): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Verify email with OTP code
  verifyEmail: async (data: VerificationFormData): Promise<VerificationResponse> => {
    const response = await axios.post<VerificationResponse>('/auth/verify-email', data);
    return response.data;
  },

  // Resend verification code
  resendVerificationCode: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post<{ success: boolean; message: string }>(
      '/auth/resend-verification', 
      { email }
    );
    return response.data;
  },

  // Verify reCAPTCHA token (if we want to verify on client side before submission)
  verifyRecaptcha: async (token: string): Promise<{ success: boolean }> => {
    const response = await axios.post<{ success: boolean }>('/auth/verify-recaptcha', { token });
    return response.data;
  },

  // Check if username is available
  checkUsernameAvailability: async (username: string): Promise<{ isAvailable: boolean }> => {
    const response = await axios.get<{ isAvailable: boolean }>(`/auth/check-username/${username}`);
    return response.data;
  },

  // Check if email is available
  checkEmailAvailability: async (email: string): Promise<{ isAvailable: boolean }> => {
    const response = await axios.get<{ isAvailable: boolean }>(`/auth/check-email/${email}`);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await axios.post('/auth/logout');
    localStorage.removeItem('accessToken');
  },
};