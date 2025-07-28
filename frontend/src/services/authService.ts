import { apiClient } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: any;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data?: {
    user: any;
    accessToken: string;
  };
  error?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  }

  async register(userData: RegisterData): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return {
        success: true,
        message: response.data.message || 'Registration successful',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await apiClient.post('/auth/forgot-password', data);
      return {
        success: true,
        message: response.data.message || 'Password reset email sent',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send reset email',
      };
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await apiClient.post('/auth/reset-password', data);
      return {
        success: true,
        message: response.data.message || 'Password reset successful',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset failed',
      };
    }
  }

  async changePassword(data: ChangePasswordData): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await apiClient.post('/auth/change-password', data);
      return {
        success: true,
        message: response.data.message || 'Password changed successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password change failed',
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Token refresh failed',
      };
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get current user');
    }
  }

  async getProfile(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.get('/auth/profile');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get profile',
      };
    }
  }

  async updateProfile(userData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.put('/auth/profile', userData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed',
      };
    }
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await apiClient.post('/auth/verify-email', { token });
      return {
        success: true,
        message: response.data.message || 'Email verified successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Email verification failed',
      };
    }
  }

  async resendVerificationEmail(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await apiClient.post('/auth/resend-verification');
      return {
        success: true,
        message: response.data.message || 'Verification email sent',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send verification email',
      };
    }
  }

  async revokeAllSessions(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await apiClient.post('/auth/revoke-all-sessions');
      return {
        success: true,
        message: response.data.message || 'All sessions revoked',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to revoke sessions',
      };
    }
  }
}

export const authService = new AuthService();
