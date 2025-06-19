import axios, { AxiosError, type AxiosResponse } from 'axios';
import { TokenService } from '../services/tokenService';
import type { RefreshTokenResponse } from '../types/auth.types';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = TokenService.getAccessToken();
    if (token && !TokenService.isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = TokenService.getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/login/refresh`,
          { refreshToken }
        );

        if (response.data.success) {
          const { accessToken, expiresIn } = response.data.data;
          
          // Update tokens (keep the same refresh token)
          TokenService.setTokens(accessToken, refreshToken, expiresIn);
          
          // Update default header
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          
          // Process queued requests
          processQueue(null, accessToken);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          throw new Error(response.data.message);
        }
      } catch (refreshError) {
        // Refresh failed - redirect to login
        processQueue(refreshError, null);
        TokenService.clearTokens();
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;