/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient, getApiMode } from './api-client';
import { mockDb } from './mock-db';
import { User } from '../types';

export const authService = {
  async login(email: string, passwordHash: string): Promise<{ success: boolean; message: string; data: User }> {
    if (getApiMode() === 'mock') {
      try {
        const user = mockDb.login(email, passwordHash);
        return {
          success: true,
          message: 'Success',
          data: user
        };
      } catch (err: any) {
        throw {
          response: {
            status: 401,
            data: {
              success: false,
              message: err.message || 'Email atau password salah',
              errors: { credentials: err.message || 'Invalid email or password' }
            }
          }
        };
      }
    }

    const response = await apiClient.post('/auth/login', { email, password: passwordHash });
    return response.data;
  },

  async logout(): Promise<{ success: boolean; message: string; data: null }> {
    if (getApiMode() === 'mock') {
      mockDb.logout();
      return { success: true, message: 'Success', data: null };
    }

    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  async getMe(): Promise<{ success: boolean; message: string; data: User }> {
    if (getApiMode() === 'mock') {
      const user = mockDb.getCurrentUser();
      if (!user) {
        throw {
          response: {
            status: 401,
            data: {
              success: false,
              message: 'Unauthorized',
              errors: { auth: 'Belum login' }
            }
          }
        };
      }
      return { success: true, message: 'Success', data: user };
    }

    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};
