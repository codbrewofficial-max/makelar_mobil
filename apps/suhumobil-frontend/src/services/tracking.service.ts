/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient, getApiMode } from './api-client';
import { mockDb } from './mock-db';
import { SystemInsight } from '../types';

export const trackingService = {
  // Public Endpoint: register landing page visit via ref source
  async registerVisit(carId?: string, source?: string): Promise<{ success: boolean; message: string }> {
    if (!source) return { success: false, message: 'Source parameter is required' };
    
    if (getApiMode() === 'mock') {
      mockDb.registerVisit(carId, source);
      return { success: true, message: 'Success' };
    }

    const response = await apiClient.post('/tracking/visit', { carId, source });
    return response.data;
  },

  // Public Endpoint: register social media click/copy link click
  async registerClick(carId?: string, source?: string): Promise<{ success: boolean; message: string }> {
    if (!source) return { success: false, message: 'Source parameter is required' };

    if (getApiMode() === 'mock') {
      mockDb.registerClick(carId, source);
      return { success: true, message: 'Success' };
    }

    const response = await apiClient.post('/tracking/click', { carId, source });
    return response.data;
  },

  // Admin Endpoint: get aggregated system insights
  async getSystemInsight(): Promise<{ success: boolean; message: string; data: SystemInsight }> {
    if (getApiMode() === 'mock') {
      const data = mockDb.getSystemInsight();
      return {
        success: true,
        message: 'Success',
        data
      };
    }

    const response = await apiClient.get('/admin/insights/system');
    return response.data;
  }
};
