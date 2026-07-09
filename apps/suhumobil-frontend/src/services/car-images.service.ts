/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient, getApiMode } from './api-client';
import { mockDb } from './mock-db';
import { Car } from '../types';

export const carImagesService = {
  // Admin Endpoint: upload image (multipart/form-data)
  async uploadImage(carId: string, file: File, isCover = false): Promise<{ success: boolean; message: string; data: any }> {
    if (getApiMode() === 'mock') {
      // In mock mode, we generate an object URL or a mock beautiful Unsplash image as fallback
      // Since it's a file upload, we can read it using FileReader or use an Unsplash image based on brand/model
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            // Use the data URL or fallback to a gorgeous unsplash car placeholder if data URL is too big
            const dataUrl = reader.result as string;
            // Unsplash beautiful filler so that photos look spectacular and high-res
            const randomInt = Math.floor(Math.random() * 1000);
            const fallbackUnsplash = `https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800&sig=${randomInt}`;
            
            const car = mockDb.uploadCarImage(carId, dataUrl || fallbackUnsplash, isCover);
            const uploadedImg = car.images[car.images.length - 1];

            resolve({
              success: true,
              message: 'Success',
              data: uploadedImg
            });
          } catch (err: any) {
            let code = 'INTERNAL_ERROR';
            let statusHttp = 500;

            if (err.message === 'IMAGE_LIMIT_EXCEEDED') {
              code = 'IMAGE_LIMIT_EXCEEDED';
              statusHttp = 422;
            } else if (err.message === 'STORAGE_QUOTA_EXCEEDED') {
              code = 'STORAGE_QUOTA_EXCEEDED';
              statusHttp = 422;
            }

            reject({
              response: {
                status: statusHttp,
                data: { success: false, message: err.message, errors: { code } }
              }
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }

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
    if (getApiMode() === 'mock') {
      try {
        const data = mockDb.setCarImageCover(carId, imageId);
        return { success: true, message: 'Success', data };
      } catch (err) {
        throw {
          response: {
            status: 404,
            data: { success: false, message: 'Mobil tidak ditemukan', errors: { code: 'CAR_NOT_FOUND' } }
          }
        };
      }
    }

    const response = await apiClient.patch(`/admin/cars/${carId}/images/${imageId}/cover`);
    return response.data;
  },

  // Admin Endpoint: reorder
  async reorderImages(carId: string, imageOrders: { id: string; sortOrder: number }[]): Promise<{ success: boolean; message: string; data: Car }> {
    if (getApiMode() === 'mock') {
      try {
        const data = mockDb.reorderCarImages(carId, imageOrders);
        return { success: true, message: 'Success', data };
      } catch (err) {
        throw {
          response: {
            status: 404,
            data: { success: false, message: 'Mobil tidak ditemukan', errors: { code: 'CAR_NOT_FOUND' } }
          }
        };
      }
    }

    const response = await apiClient.put(`/admin/cars/${carId}/images/reorder`, { imageOrders });
    return response.data;
  },

  // Admin Endpoint: delete single image
  async deleteImage(carId: string, imageId: string): Promise<{ success: boolean; message: string; data: Car }> {
    if (getApiMode() === 'mock') {
      try {
        const data = mockDb.deleteCarImage(carId, imageId);
        return { success: true, message: 'Success', data };
      } catch (err) {
        throw {
          response: {
            status: 404,
            data: { success: false, message: 'Mobil tidak ditemukan', errors: { code: 'CAR_NOT_FOUND' } }
          }
        };
      }
    }

    const response = await apiClient.delete(`/admin/cars/${carId}/images/${imageId}`);
    return response.data;
  }
};
