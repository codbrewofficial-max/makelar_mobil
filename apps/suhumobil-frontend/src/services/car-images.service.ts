/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './api-client';
import { Car } from '../types';

export const carImagesService = {
  // Admin Endpoint: upload image (multipart/form-data)
  async uploadImage(carId: string, file: File, isCover = false): Promise<{ success: boolean; message: string; data: any }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isCover', String(isCover));

    const response = await apiClient.post(`/admin/cars/${carId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Admin Endpoint: set as cover
  async setCover(carId: string, imageId: string): Promise<{ success: boolean; message: string; data: Car }> {
    const response = await apiClient.patch(`/admin/cars/${carId}/images/${imageId}/cover`);
    return response.data;
  },

  // Admin Endpoint: reorder
  async reorderImages(carId: string, imageOrders: { id: string; sortOrder: number }[]): Promise<{ success: boolean; message: string; data: Car }> {
    const response = await apiClient.put(`/admin/cars/${carId}/images/reorder`, { imageOrders });
    return response.data;
  },

  // Admin Endpoint: delete single image
  async deleteImage(carId: string, imageId: string): Promise<{ success: boolean; message: string; data: Car }> {
    const response = await apiClient.delete(`/admin/cars/${carId}/images/${imageId}`);
    return response.data;
  }
};
