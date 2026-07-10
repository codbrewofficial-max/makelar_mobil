/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './api-client';

export interface MediaAsset {
  id: string;
  url: string;
  sourceType: 'UPLOAD' | 'EXTERNAL_LINK' | 'AI_GENERATED';
  fileHash: string | null;
  sizeBytes: number | null;
  altText: string | null;
  uploadedBy: string;
  createdAt: string;
}

export const mediaService = {
  // Admin Endpoint: list media (paginated)
  async listMedia(params?: { page?: number; limit?: number; sourceType?: string }): Promise<{ success: boolean; message: string; data: MediaAsset[]; meta?: any }> {
    const response = await apiClient.get('/admin/media', { params });
    return response.data;
  },

  // Admin Endpoint: upload file
  async uploadMedia(file: File): Promise<{ success: boolean; message: string; data: MediaAsset }> {
    const formData = new FormData();
    formData.append('file', file);

    // 🔧 FIX: jangan hardcode 'multipart/form-data' (tidak ada boundary → gagal diparse backend).
    const response = await apiClient.post('/admin/media/upload', formData, {
      headers: { 'Content-Type': undefined }
    });
    return response.data;
  },

  // Admin Endpoint: add external link
  async createMediaLink(url: string, altText?: string): Promise<{ success: boolean; message: string; data: MediaAsset }> {
    const response = await apiClient.post('/admin/media/link', { url, altText });
    return response.data;
  },

  // Admin Endpoint: delete media asset
  async deleteMedia(id: string): Promise<{ success: boolean; message: string; data: null }> {
    const response = await apiClient.delete(`/admin/media/${id}`);
    return response.data;
  }
};
