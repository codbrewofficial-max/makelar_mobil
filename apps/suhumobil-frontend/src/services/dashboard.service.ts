/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './api-client';
import { DashboardStats } from '../types';

export const dashboardService = {
  // Admin Endpoint: get stats summary
  async getStats(): Promise<{ success: boolean; message: string; data: DashboardStats }> {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  }
};
