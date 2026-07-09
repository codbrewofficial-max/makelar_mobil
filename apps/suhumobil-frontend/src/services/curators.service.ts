/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './api-client';
import { Curator } from '../types';

export const curatorsService = {
  // Public & Admin Endpoint: get curators
  async getCurators(filters?: { search?: string }): Promise<{ success: boolean; message: string; data: Curator[] }> {
    const response = await apiClient.get('/curators', { params: filters });
    return response.data;
  },

  // Public & Admin Endpoint: get curator by id
  async getCuratorById(id: string): Promise<{ success: boolean; message: string; data: Curator }> {
    const response = await apiClient.get(`/curators/${id}`);
    return response.data;
  },

  // Admin Endpoint: create curator
  async createCurator(curatorData: Omit<Curator, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; data: Curator }> {
    const response = await apiClient.post('/admin/curators', curatorData);
    return response.data;
  },

  // Admin Endpoint: update curator
  async updateCurator(id: string, curatorData: Partial<Curator>): Promise<{ success: boolean; message: string; data: Curator }> {
    const response = await apiClient.put(`/admin/curators/${id}`, curatorData);
    return response.data;
  },

  // Admin Endpoint: upload photo
  async uploadPhoto(id: string, file: File): Promise<{ success: boolean; message: string; data: Curator }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/admin/curators/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Admin Endpoint: delete curator
  async deleteCurator(id: string): Promise<{ success: boolean; message: string; data: null }> {
    const response = await apiClient.delete(`/admin/curators/${id}`);
    return response.data;
  }
};
