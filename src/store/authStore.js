import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      setUser: (user) => {
        set({ user });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error || 'Login failed';
            throw new Error(errorMessage);
          }

          const data = await response.json();
          const { access_token, refresh_token, user } = data;

          set({
            accessToken: access_token,
            refreshToken: refresh_token,
            user,
            isLoading: false,
          });

          return { success: true, user };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/signup`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.errors?.join(', ') || errorData.error || 'Signup failed';
            throw new Error(errorMessage);
          }

          const data = await response.json();
          const { access_token, refresh_token, user } = data;

          set({
            accessToken: access_token,
            refreshToken: refresh_token,
            user,
            isLoading: false,
          });

          return { success: true, user };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
