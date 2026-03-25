/**
 * Authentication store using Zustand.
 *
 * Manages the authenticated user and login/signup state. This is client state
 * (not server state) because the auth session is a local concern — we don't
 * refetch it on window focus or cache it with stale-while-revalidate semantics
 * the way we would with server data. React Query would be the wrong tool here.
 */
import { create } from 'zustand';
import type { AuthState, LoginCredentials, SignupCredentials, User } from '@/types';
import { simulateLogin, simulateSignup } from '@/api/auth';
import { resetMockSettings } from '@/api/settings';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const user: User = await simulateLogin(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Login failed',
        isLoading: false,
      });
    }
  },

  signup: async (credentials: SignupCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const user: User = await simulateSignup(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Signup failed',
        isLoading: false,
      });
    }
  },

  logout: () => {
    resetMockSettings();
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => {
    set({ error: null });
  },

  updateDisplayName: (name: string) => {
    set((state) => ({
      user: state.user ? { ...state.user, displayName: name } : null,
    }));
  },
}));
