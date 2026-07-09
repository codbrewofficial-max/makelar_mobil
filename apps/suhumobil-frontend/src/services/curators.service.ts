/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient, getApiMode } from './api-client';
import { mockDb } from './mock-db';
import { Curator } from '../types';

export const curatorsService = {
  // Public & Admin Endpoint: get curators
  async getCurators(filters?: { search?: string }): Promise<{ success: boolean; message: string; data: Curator[] }> {
    if (getApiMode() === 'mock') {
      const data = mockDb.getCurators(filters);
      return {
        success: true,
        message: 'Success',
        data
      };
    }

    const response = await apiClient.get('/curators', { params: filters });
    return response.data;
  },

  // Public & Admin Endpoint: get curator by id
  async getCuratorById(id: string): Promise<{ success: boolean; message: string; data: Curator }> {
    if (getApiMode() === 'mock') {
      const curator = mockDb.getCuratorById(id);
      if (!curator) {
        throw {
          response: {
            status: 404,
            data: { success: false, message: 'Kurator tidak ditemukan', errors: { code: 'CURATOR_NOT_FOUND' } }
          }
        };
      }
      return { success: true, message: 'Success', data: curator };
    }

    const response = await apiClient.get(`/curators/${id}`);
    return response.data;
  },

  // Admin Endpoint: create curator
  async createCurator(curatorData: Omit<Curator, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; data: Curator }> {
    if (getApiMode() === 'mock') {
      const data = mockDb.createCurator(curatorData);
      return { success: true, message: 'Success', data };
    }

    const response = await apiClient.post('/admin/curators', curatorData);
    return response.data;
  },

  // Admin Endpoint: update curator
  async updateCurator(id: string, curatorData: Partial<Curator>): Promise<{ success: boolean; message: string; data: Curator }> {
    if (getApiMode() === 'mock') {
      try {
        const data = mockDb.updateCurator(id, curatorData);
        return { success: true, message: 'Success', data };
      } catch (err) {
        throw {
          response: {
            status: 404,
            data: { success: false, message: 'Kurator tidak ditemukan', errors: { code: 'CURATOR_NOT_FOUND' } }
          }
        };
      }
    }

    const response = await apiClient.put(`/admin/curators/${id}`, curatorData);
    return response.data;
  },

  // Admin Endpoint: upload photo
  async uploadPhoto(id: string, file: File): Promise<{ success: boolean; message: string; data: Curator }> {
    if (getApiMode() === 'mock') {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const fallback = `https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=500`;
          const updated = mockDb.updateCurator(id, { photoUrl: dataUrl || fallback });
          resolve({
            success: true,
            message: 'Success',
            data: updated
          });
        };
        reader.readAsDataURL(file);
      });
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/admin/curators/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Admin Endpoint: delete curator
  async deleteCurator(id: string): Promise<{ success: boolean; message: string; data: null }> {
    if (getApiMode() === 'mock') {
      try {
        mockDb.deleteCurator(id);
        return { success: true, message: 'Success', data: null };
      } catch (err) {
        throw {
          response: {
            status: 404,
            data: { success: false, message: 'Kurator tidak ditemukan', errors: { code: 'CURATOR_NOT_FOUND' } }
          }
        };
      }
    }

    const response = await apiClient.delete(`/admin/curators/${id}`);
    return response.data;
  }
};
