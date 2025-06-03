import { apiClient } from './api';
import type {
    LoginRequest,
    LoginResponse,
    RefreshTokenResponse,
    ValidateTokenResponse,
    UserInfoResponse,
} from '../types/auth.types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/login', credentials);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/refresh', {
      refreshToken,
    });
    return response.data;
  },

  logout: async (userId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/logout', { userId });
    return response.data;
  },

  validateToken: async (token: string): Promise<ValidateTokenResponse> => {
    const response = await apiClient.post<ValidateTokenResponse>('/validate', {
      token,
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<UserInfoResponse> => {
    const response = await apiClient.get<UserInfoResponse>('/user-info');
    return response.data;
  },
};