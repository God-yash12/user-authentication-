export interface User {
    id: string;
    username: string;
    email: string;
    isEmailVerified: boolean;
    fullName?: string;
    createdAt?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginRequest {
    email: string;
    password: string;
    recaptchaToken?: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
}

export interface RefreshTokenResponse {
    success: boolean;
    message: string;
    data: AuthTokens;
}

export interface ValidateTokenResponse {
    success: boolean;
    valid: boolean;
    data: {
        user: User;
    };
}

export interface UserInfoResponse {
    success: boolean;
    data: {
        id: string;
        user: User;
    };
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
}