import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import api from '../lib/api';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage key for JWT only
const TOKEN_KEY = 'business_nexus_token';

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app load: check for JWT, rehydrate user from API
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // Login via backend API
  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password, role });
      const { token, user: userData } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      setUser(userData);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Register via backend API
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token, user: userData } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      setUser(userData);
      toast.success('Account created successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password - mock for now (no email service)
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      // In production this would call POST /api/auth/forgot-password
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send reset email';
      toast.error(message);
      throw new Error(message);
    }
  };

  // Reset password - mock for now
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      // In production this would call POST /api/auth/reset-password
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password reset successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Password reset failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  // Logout - clear token and user
  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    toast.success('Logged out successfully');
  };

  // Update profile via backend API
  const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      const response = await api.put(`/users/${userId}`, updates);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Profile update failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
