/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient, getApiMode } from './api-client';
import { mockDb } from './mock-db';
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
    if (getApiMode() === 'mock') {
      const data = mockDb.getCars({ ...filters, status: CarStatus.PUBLISHED });
      return {
        success: true,
        message: 'Success',
        data,
        meta: { page: 1, limit: 12, total: data.length, totalPages: Math.ceil(data.length / 12) }
      };
    }

    const response = await apiClient.get('/cars', { params: filters });
    return response.data;
  },

  // Public Endpoint: get car by slug
  async getCarBySlug(slug: string): Promise<{ success: boolean; message: string; data: Car }> {
    if (getApiMode() === 'mock') {
      const car = mockDb.getCarBySlug(slug);
      if (!car) {
        throw {
          response: {
            status: 404,
            data: { success: false, message: 'Mobil tidak ditemukan', errors: { code: 'CAR_NOT_FOUND' } }
          }
        };
      }
      return { success: true, message: 'Success', data: car };
    }

    const response = await apiClient.get(`/cars/${slug}`);
    return response.data;
  },

  // Admin Endpoint: list all cars
  async getAdminCars(filters?: { status?: string; search?: string }): Promise<{ success: boolean; message: string; data: Car[]; meta?: any }> {
    if (getApiMode() === 'mock') {
      const data = mockDb.getCars({ ...filters, status: filters?.status || 'ALL' });
      return {
        success: true,
        message: 'Success',
        data,
        meta: { page: 1, limit: 50, total: data.length, totalPages: Math.ceil(data.length / 50) }
      };
    }

    const response = await apiClient.get('/admin/cars', { params: filters });
    return response.data;
  },

  // Admin Endpoint: get admin car by id
  async getAdminCarById(id: string): Promise<{ success: boolean; message: string; data: Car }> {
    if (getApiMode() === 'mock') {
      const car = mockDb.getCarById(id);
      if (!car) {
        throw {
          response: {
            status: 404,
            data: { success: false, message: 'Mobil tidak ditemukan', errors: { code: 'CAR_NOT_FOUND' } }
          }
        };
      }
      return { success: true, message: 'Success', data: car };
    }

    const response = await apiClient.get(`/admin/cars/${id}`);
    return response.data;
  },

  // Admin Endpoint: create car
  async createCar(carData: Omit<Car, 'id' | 'slug' | 'status' | 'images' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; data: Car }> {
    if (getApiMode() === 'mock') {
      const data = mockDb.createCar(carData);
      return { success: true, message: 'Success', data };
    }

    const response = await apiClient.post('/admin/cars', carData);
    return response.data;
  },

  // Admin Endpoint: update car
  async updateCar(id: string, carData: Partial<Car>): Promise<{ success: boolean; message: string; data: Car }> {
    if (getApiMode() === 'mock') {
      try {
        const data = mockDb.updateCar(id, carData);
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

    const response = await apiClient.put(`/admin/cars/${id}`, carData);
    return response.data;
  },

  // Admin Endpoint: patch status
  async updateCarStatus(id: string, status: CarStatus): Promise<{ success: boolean; message: string; data: { id: string; status: CarStatus } }> {
    if (getApiMode() === 'mock') {
      try {
        const car = mockDb.updateCarStatus(id, status);
        return {
          success: true,
          message: 'Success',
          data: { id: car.id, status: car.status }
        };
      } catch (err: any) {
        let code = 'INVALID_STATUS_TRANSITION';
        let message = 'Perubahan status tidak diizinkan';
        let statusHttp = 409;
        
        if (err.message === 'IMAGE_MINIMUM_NOT_MET') {
          code = 'IMAGE_MINIMUM_NOT_MET';
          message = 'Mobil membutuhkan minimal 5 foto sebelum dipublikasikan';
          statusHttp = 422;
        }

        throw {
          response: {
            status: statusHttp,
            data: { success: false, message, errors: { code } }
          }
        };
      }
    }

    const response = await apiClient.patch(`/admin/cars/${id}/status`, { status });
    return response.data;
  },

  // Admin Endpoint: delete car
  async deleteCar(id: string): Promise<{ success: boolean; message: string; data: null }> {
    if (getApiMode() === 'mock') {
      try {
        mockDb.deleteCar(id);
        return { success: true, message: 'Success', data: null };
      } catch (err) {
        throw {
          response: {
            status: 404,
            data: { success: false, message: 'Mobil tidak ditemukan', errors: { code: 'CAR_NOT_FOUND' } }
          }
        };
      }
    }

    const response = await apiClient.delete(`/admin/cars/${id}`);
    return response.data;
  }
};
