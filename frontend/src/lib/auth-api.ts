import api from '../api/api';
import type { AuthResponse, SignupResponse, SignupFormData, LoginFormData, VerifyOtpFormData, User, GenerateOtpResponse, VerifyOtpResponse, ResetPasswordResponse } from '../types/auth.types';

export const authService = {
  async signup(data: SignupFormData): Promise<SignupResponse> {
    const response = await api.post<SignupResponse>('/signup', data);
    return response.data;
  },

  async verifyOtp(data: VerifyOtpFormData): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/signup/verify-otp', data);
    return response.data;
  },

  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/login', data);
    return response.data;
  },

  async getProfile(): Promise<{ success: boolean; data: User }> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async generateOTP(email: string): Promise<GenerateOtpResponse> {
    const response = await api.post<GenerateOtpResponse>('/auth/generate-otp', { email });
    return response.data;
  },

  async verifyOTP(email: string, otp: string): Promise<VerifyOtpResponse> {
    const response = await api.post<VerifyOtpResponse>('/auth/verify-otp', { email, otp });
    return response.data;
  },

  async resetPassword(email: string, newPassword: string): Promise<ResetPasswordResponse> {
    const response = await api.post<ResetPasswordResponse>('/auth/reset-password', { email, newPassword });
    return response.data;
  },

  async getUsersData(): Promise<User[]> {
    const response = await api.get<User[]>('/get-users-data');
    return response.data;
  }
};

export { api };
