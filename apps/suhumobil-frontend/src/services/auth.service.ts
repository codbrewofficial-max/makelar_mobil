/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './api-client';
import { User } from '../types';

export const authService = {
  async login(email: string, passwordHash: string): Promise<{ success: boolean; message: string; data: User }> {
    const response = await apiClient.post('/auth/login', { email, password: passwordHash });
    return response.data;
  },

  async logout(): Promise<{ success: boolean; message: string; data: null }> {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  async getMe(): Promise<{ success: boolean; message: string; data: User }> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};
