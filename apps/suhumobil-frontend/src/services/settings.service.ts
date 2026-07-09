/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient, getApiMode } from './api-client';
import { mockDb } from './mock-db';
import { PublicSettings, AdminSettings } from '../types';

export const settingsService = {
  // Public Endpoint: get public site settings
  async getPublicSettings(): Promise<{ success: boolean; message: string; data: PublicSettings }> {
    if (getApiMode() === 'mock') {
      const data = mockDb.getPublicSettings();
      return { success: true, message: 'Success', data };
    }

    const response = await apiClient.get('/settings/public');
    return response.data;
  },

  // Admin Endpoint: get all admin-level settings
  async getAdminSettings(): Promise<{ success: boolean; message: string; data: AdminSettings }> {
    if (getApiMode() === 'mock') {
      const data = mockDb.getAdminSettings();
      return { success: true, message: 'Success', data };
    }

    const response = await apiClient.get('/admin/settings');
    return response.data;
  },

  // Admin Endpoint: update settings (bulk key-value)
  async updateSettings(settings: Partial<AdminSettings>): Promise<{ success: boolean; message: string; data: AdminSettings }> {
    if (getApiMode() === 'mock') {
      const data = mockDb.updateSettings(settings);
      return { success: true, message: 'Success', data };
    }

    const response = await apiClient.put('/admin/settings', settings);
    return response.data;
  },

  // Admin Endpoint: upload business logo
  async uploadLogo(file: File): Promise<{ success: boolean; message: string; data: { logoUrl: string } }> {
    if (getApiMode() === 'mock') {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const fallback = 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=200';
          const finalLogo = dataUrl || fallback;
          mockDb.updateSettings({
            businessProfile: {
              ...mockDb.getAdminSettings().businessProfile,
              logoUrl: finalLogo
            }
          });
          resolve({
            success: true,
            message: 'Success',
            data: { logoUrl: finalLogo }
          });
        };
        reader.readAsDataURL(file);
      });
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/admin/settings/branding/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
