/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './api-client';
import { SystemInsight } from '../types';

export const trackingService = {
  // Public Endpoint: register landing page visit via ref source
  async registerVisit(carId?: string, source?: string): Promise<{ success: boolean; message: string }> {
    if (!source) return { success: false, message: 'Source parameter is required' };
    const response = await apiClient.post('/tracking/visit', { carId, source });
    return response.data;
  },

  // Public Endpoint: register social media click/copy link click
  async registerClick(carId?: string, source?: string): Promise<{ success: boolean; message: string }> {
    if (!source) return { success: false, message: 'Source parameter is required' };
    const response = await apiClient.post('/tracking/click', { carId, source });
    return response.data;
  },

  // Admin Endpoint: get aggregated system insights
  async getSystemInsight(): Promise<{ success: boolean; message: string; data: SystemInsight }> {
    const response = await apiClient.get('/admin/insights/system');
    return response.data;
  }
};
