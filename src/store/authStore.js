import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CODE_LENGTH } from '../config/auth';

// Passwordless sign-in against the API:
//   POST /auth/code   { email }        -> 202, an 8-digit code is emailed
//   POST /auth/verify { email, code }  -> { access_token, refresh_token, user }
// An address with no account gets one on its first verified code, so
// joining and signing in are the same two calls.

const apiUrl = () => import.meta.env.VITE_API_URL;

async function postJson(path, body, token) {
  const response = await fetch(`${apiUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  return { ok: response.ok, status: response.status, data };
}

function messageFor(status, data, fallback) {
  if (status === 429) return 'Too many tries. Wait a few minutes, then ask for a new code.';
  if (status === 401) return "That code didn't work. Check it, or ask for a new one.";
  return data?.error || data?.errors?.[0]?.detail || fallback;
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      pendingEmail: null,
      isLoading: false,
      error: null,

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Step 1: email a code. The API answers the same way whether or not
      // the address has an account.
      requestCode: async (email) => {
        const clean = String(email || '').trim().toLowerCase();
        if (!clean || !clean.includes('@')) {
          const error = 'Enter the email address you want the code sent to.';
          set({ error });
          return { success: false, error };
        }
        set({ isLoading: true, error: null });
        try {
          const { ok, status, data } = await postJson('/auth/code', { email: clean });
          if (!ok) throw new Error(messageFor(status, data, "We couldn't send a code. Try again."));
          set({ isLoading: false, pendingEmail: clean });
          return { success: true };
        } catch (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Step 2: trade the code for tokens.
      verifyCode: async (code, email = get().pendingEmail) => {
        const digits = String(code || '').replace(/\D/g, '');
        if (!email) {
          const error = 'Start again: enter your email to get a new code.';
          set({ error });
          return { success: false, error };
        }
        if (digits.length !== CODE_LENGTH) {
          const error = `Enter all ${CODE_LENGTH} digits of the code.`;
          set({ error });
          return { success: false, error };
        }
        set({ isLoading: true, error: null });
        try {
          const { ok, status, data } = await postJson('/auth/verify', { email, code: digits });
          if (!ok) throw new Error(messageFor(status, data, "We couldn't sign you in. Try again."));
          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            user: data.user,
            pendingEmail: null,
            isLoading: false,
          });
          return { success: true, user: data.user };
        } catch (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Ends the session on the server too, when we can reach it.
      logout: () => {
        const { accessToken } = get();
        if (accessToken) {
          fetch(`${apiUrl()}/auth/logout`, {
            method: 'DELETE',
            headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
          }).catch(() => {});
        }
        set({ user: null, accessToken: null, refreshToken: null, pendingEmail: null, error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        pendingEmail: state.pendingEmail,
      }),
    }
  )
);
