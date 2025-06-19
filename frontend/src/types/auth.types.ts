export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    message: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    expiresIn: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
}

export interface SignupFormData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  recaptchaToken: string;
}

export interface LoginFormData {
  identifier: string;
  password: string;
  recaptchaToken: string;
}

export interface VerifyOtpFormData {
  userId: string;
  otpCode: string;
}


export interface AuthContextType {
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
};


// Add these to your existing auth types
export interface GenerateOtpResponse {
  email: any;
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    message: string;
  };
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordFormData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}