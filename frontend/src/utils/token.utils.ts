// Enhanced tokenUtils with cookie support and JWT decoding
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Cookie configuration
const COOKIE_OPTIONS = {
  secure: true,        // Only send over HTTPS in production
  sameSite: 'strict',  // CSRF protection
  httpOnly: false,     // Set to true for better security, but you won't be able to read it with JS
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

export interface JWTPayload {
  sub: string;           // User ID
  email: string;
  username: string;
  isEmailVerified: boolean;
  iat: number;          // Issued at
  exp: number;          // Expires at
}

export const tokenUtils = {
  // ===== LOCAL STORAGE METHODS =====
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokensInLocalStorage: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokensFromLocalStorage: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // ===== COOKIE METHODS =====
  setTokensInCookies: (accessToken: string, refreshToken: string): void => {
    // Set access token cookie (shorter expiry)
    document.cookie = `${ACCESS_TOKEN_KEY}=${accessToken}; max-age=${15 * 60}; path=/; ${COOKIE_OPTIONS.secure ? 'secure;' : ''} samesite=${COOKIE_OPTIONS.sameSite}`;
    
    // Set refresh token cookie (longer expiry)
    document.cookie = `${REFRESH_TOKEN_KEY}=${refreshToken}; max-age=${COOKIE_OPTIONS.maxAge / 1000}; path=/; ${COOKIE_OPTIONS.secure ? 'secure;' : ''} samesite=${COOKIE_OPTIONS.sameSite}`;
  },

  getTokensFromCookies: (): { accessToken: string | null; refreshToken: string | null } => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    return {
      accessToken: cookies[ACCESS_TOKEN_KEY] || null,
      refreshToken: cookies[REFRESH_TOKEN_KEY] || null,
    };
  },

  clearTokensFromCookies: (): void => {
    document.cookie = `${ACCESS_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;`;
    document.cookie = `${REFRESH_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;`;
  },

  // ===== JWT DECODING METHODS =====
  decodeToken: (token: string): JWTPayload | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload as JWTPayload;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  },

  getUserInfo: (token?: string): JWTPayload | null => {
    const accessToken = token || tokenUtils.getAccessToken() || tokenUtils.getTokensFromCookies().accessToken;
    
    if (!accessToken) {
      return null;
    }

    return tokenUtils.decodeToken(accessToken);
  },

  getUserId: (token?: string): string | null => {
    const payload = tokenUtils.getUserInfo(token);
    return payload?.sub || null; // sub contains the user ID
  },

  getUserEmail: (token?: string): string | null => {
    const payload = tokenUtils.getUserInfo(token);
    return payload?.email || null;
  },

  getUsername: (token?: string): string | null => {
    const payload = tokenUtils.getUserInfo(token);
    return payload?.username || null;
  },

  isEmailVerified: (token?: string): boolean => {
    const payload = tokenUtils.getUserInfo(token);
    return payload?.isEmailVerified || false;
  },

  // ===== TOKEN VALIDATION =====
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  },

  isAccessTokenValid: (): boolean => {
    const accessToken = tokenUtils.getAccessToken() || tokenUtils.getTokensFromCookies().accessToken;
    if (!accessToken) return false;
    return !tokenUtils.isTokenExpired(accessToken);
  },

  // ===== UNIFIED METHODS (works with both localStorage and cookies) =====
  setTokens: (accessToken: string, refreshToken: string, useCookies: boolean = false): void => {
    if (useCookies) {
      tokenUtils.setTokensInCookies(accessToken, refreshToken);
    } else {
      tokenUtils.setTokensInLocalStorage(accessToken, refreshToken);
    }
  },

  clearTokens: (useCookies: boolean = false): void => {
    if (useCookies) {
      tokenUtils.clearTokensFromCookies();
    } else {
      tokenUtils.clearTokensFromLocalStorage();
    }
    // Clear both for safety
    tokenUtils.clearTokensFromLocalStorage();
    tokenUtils.clearTokensFromCookies();
  },

  // ===== UTILITY METHODS =====
  formatTokenExpiry: (token: string): string | null => {
    const payload = tokenUtils.decodeToken(token);
    if (!payload?.exp) return null;
    
    return new Date(payload.exp * 1000).toLocaleString();
  },

  getTokenTimeRemaining: (token: string): number => {
    const payload = tokenUtils.decodeToken(token);
    if (!payload?.exp) return 0;
    
    const currentTime = Date.now() / 1000;
    return Math.max(0, payload.exp - currentTime);
  },
};

// ===== USAGE EXAMPLES =====

// Example usage in your app:
export const useTokens = () => {
  // Set tokens (choose localStorage or cookies)
  const saveTokens = (accessToken: string, refreshToken: string, useCookies = false) => {
    tokenUtils.setTokens(accessToken, refreshToken, useCookies);
  };

  // Get user information from token
  const getCurrentUser = () => {
    const userInfo = tokenUtils.getUserInfo();
    if (userInfo) {
      return {
        id: userInfo.sub,           // User ID
        email: userInfo.email,      // Email
        username: userInfo.username, // Username
        isEmailVerified: userInfo.isEmailVerified,
        tokenExpiresAt: new Date(userInfo.exp * 1000),
      };
    }
    return null;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return tokenUtils.isAccessTokenValid();
  };

  // Logout function
  const logout = () => {
    tokenUtils.clearTokens(true); 
  };

  return {
    saveTokens,
    getCurrentUser,
    isAuthenticated,
    logout,
    getUserId: tokenUtils.getUserId,
    getUserEmail: tokenUtils.getUserEmail,
    getUsername: tokenUtils.getUsername,
    isEmailVerified: tokenUtils.isEmailVerified,
  };
};
