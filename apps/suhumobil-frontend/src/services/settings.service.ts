/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './api-client';
import { PublicSettings, AdminSettings } from '../types';

export const settingsService = {
  // Public Endpoint: get public site settings
  async getPublicSettings(): Promise<{ success: boolean; message: string; data: PublicSettings }> {
    const response = await apiClient.get('/settings/public');
    return response.data;
  },

  // Admin Endpoint: get all admin-level settings
  async getAdminSettings(): Promise<{ success: boolean; message: string; data: AdminSettings }> {
    const response = await apiClient.get('/admin/settings');
    return response.data;
  },

  // Admin Endpoint: update settings (bulk key-value)
  async updateSettings(settings: Partial<AdminSettings>): Promise<{ success: boolean; message: string; data: AdminSettings }> {
    const response = await apiClient.put('/admin/settings', settings);
    return response.data;
  },

  // Admin Endpoint: upload business logo
  async uploadLogo(file: File): Promise<{ success: boolean; message: string; data: { logoUrl: string } }> {
    const formData = new FormData();
    formData.append('file', file);

    // 🔧 FIX: sama seperti curatorsService.uploadPhoto — jangan hardcode 'multipart/form-data'.
    const response = await apiClient.post('/admin/settings/branding/logo', formData, {
      headers: { 'Content-Type': undefined }
    });
    return response.data;
  }
};
