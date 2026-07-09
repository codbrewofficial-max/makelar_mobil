/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { User } from '../types';
import { authService } from './auth.service';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, passwordHash: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, passwordHash: string) => {
    set({ isLoading: true });
    try {
      const res = await authService.login(email, passwordHash);
      set({ user: res.data, isAuthenticated: true, isLoading: false });
      return res.data;
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch (err) {
      console.error('Error logging out from backend:', err);
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await authService.getMe();
      set({ user: res.data, isAuthenticated: true, isLoading: false });
      return res.data;
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  }
}));
