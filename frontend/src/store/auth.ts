import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';
import { AUTH_CONFIG } from '@/lib/config';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  isVerified: boolean;
  subscription?: {
    plan: string;
    status: string;
    expiresAt: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          const { token, refreshToken, user } = response;
          
          // Store tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
            localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
          }
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(userData);
          const { token, user } = response;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
          }
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        try {
          authApi.logout();
        } catch (error) {
          // Silent fail for logout API call
        }
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
          localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshToken: async () => {
        try {
          const refreshToken = typeof window !== 'undefined' 
            ? localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY)
            : null;
            
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          
          const response = await authApi.refreshToken(refreshToken);
          const { token } = response;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
          }
          
          set({ token });
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      updateProfile: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);