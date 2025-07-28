import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState } from '../store';
import { logout as logoutAction, setUser, setLoading } from '../store/slices/authSlice';
import { authService } from '../services/authService';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[];
  organizationId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isLoading } = useSelector((state: RootState) => state.auth);

  const isAuthenticated = !!token && !!user;

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.login({ email, password });
      
      if (response.success) {
        dispatch(setUser({
          user: response.data.user,
          token: response.data.accessToken,
        }));
        
        // Store token in localStorage
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const register = useCallback(async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationId?: string;
  }) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.register(userData);
      
      if (response.success) {
        return { success: true, message: 'Registration successful' };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      // Call logout API if needed
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // Clear Redux state
      dispatch(logoutAction());
    }
  }, [dispatch]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.forgotPassword({ email });
      
      if (response.success) {
        return { success: true, message: 'Password reset email sent' };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to send reset email' 
      };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.resetPassword({ token, newPassword });
      
      if (response.success) {
        return { success: true, message: 'Password reset successful' };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Password reset failed' 
      };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken({ refreshToken });
      
      if (response.success) {
        dispatch(setUser({
          user: response.data.user,
          token: response.data.accessToken,
        }));
        
        localStorage.setItem('token', response.data.accessToken);
        return true;
      } else {
        // Refresh failed, logout user
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  }, [dispatch, logout]);

  const updateProfile = useCallback(async (userData: Partial<User>) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.updateProfile(userData);
      
      if (response.success) {
        dispatch(setUser({
          user: response.data,
          token,
        }));
        return { success: true, message: 'Profile updated successfully' };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Profile update failed' 
      };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, token]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshToken,
    updateProfile,
  };
};
