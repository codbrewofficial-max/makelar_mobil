/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './api-client';

export const contentSectionsService = {
  // Admin Endpoint: get all sections for a page
  async getAdminContent(page: string): Promise<{ success: boolean; message: string; data: Record<string, any> }> {
    const response = await apiClient.get(`/admin/content/${page}`);
    return response.data;
  },

  // Admin Endpoint: upsert one section
  async updateSection(page: string, sectionKey: string, content: Record<string, any>): Promise<{ success: boolean; message: string; data: any }> {
    const response = await apiClient.put(`/admin/content/${page}/${sectionKey}`, { content });
    return response.data;
  }
};
