/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient, getApiMode } from './api-client';
import { mockDb } from './mock-db';
import { DashboardStats } from '../types';

export const dashboardService = {
  // Admin Endpoint: get stats summary
  async getStats(): Promise<{ success: boolean; message: string; data: DashboardStats }> {
    if (getApiMode() === 'mock') {
      const data = mockDb.getDashboardStats();
      return { success: true, message: 'Success', data };
    }

    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  }
};
