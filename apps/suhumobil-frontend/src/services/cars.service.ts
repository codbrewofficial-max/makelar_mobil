/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './api-client';
import { Car, CarStatus } from '../types';

export const carsService = {
  // Public Endpoint: list published cars only
  async getCars(filters?: {
    brand?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    transmission?: string;
    search?: string;
  }): Promise<{ success: boolean; message: string; data: Car[]; meta?: any }> {
    const response = await apiClient.get('/cars', { params: filters });
    return response.data;
  },

  // Public Endpoint: get car by slug
  async getCarBySlug(slug: string): Promise<{ success: boolean; message: string; data: Car }> {
    const response = await apiClient.get(`/cars/${slug}`);
    return response.data;
  },

  // Admin Endpoint: list all cars
  // 🆕 addendum 09 Section 6 — backend sekarang mengembalikan meta pagination (page/limit/total/totalPages),
  // tambahkan param page/limit di sini kalau UI CarsList.tsx sudah pakai kontrol halaman.
  async getAdminCars(filters?: { page?: number; limit?: number; status?: string; search?: string }): Promise<{ success: boolean; message: string; data: Car[]; meta?: any }> {
    const response = await apiClient.get('/admin/cars', { params: filters });
    return response.data;
  },

  // Admin Endpoint: get admin car by id
  async getAdminCarById(id: string): Promise<{ success: boolean; message: string; data: Car }> {
    const response = await apiClient.get(`/admin/cars/${id}`);
    return response.data;
  },

  // Admin Endpoint: create car
  // NOTE: body boleh menyertakan `inspectedById` (uuid kurator) - lihat addendum 09 Section 7.2
  async createCar(carData: Omit<Car, 'id' | 'slug' | 'status' | 'images' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; data: Car }> {
    const response = await apiClient.post('/admin/cars', carData);
    return response.data;
  },

  // Admin Endpoint: update car
  async updateCar(id: string, carData: Partial<Car>): Promise<{ success: boolean; message: string; data: Car }> {
    const response = await apiClient.put(`/admin/cars/${id}`, carData);
    return response.data;
  },

  // Admin Endpoint: patch status
  async updateCarStatus(id: string, status: CarStatus): Promise<{ success: boolean; message: string; data: { id: string; status: CarStatus } }> {
    const response = await apiClient.patch(`/admin/cars/${id}/status`, { status });
    return response.data;
  },

  // Admin Endpoint: delete car
  async deleteCar(id: string): Promise<{ success: boolean; message: string; data: null }> {
    const response = await apiClient.delete(`/admin/cars/${id}`);
    return response.data;
  }
};
