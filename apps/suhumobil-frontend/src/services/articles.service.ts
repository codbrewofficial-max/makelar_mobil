/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient, getApiMode } from './api-client';
import { mockDb } from './mock-db';
import { Article, ArticleStatus } from '../types';

export const articlesService = {
  // Public Endpoint: get published articles
  async getArticles(filters?: { tag?: string; search?: string }): Promise<{ success: boolean; message: string; data: Article[]; meta?: any }> {
    if (getApiMode() === 'mock') {
      const data = mockDb.getArticles({ ...filters, status: ArticleStatus.PUBLISHED });
      return {
        success: true,
        message: 'Success',
        data,
        meta: { page: 1, limit: 12, total: data.length, totalPages: Math.ceil(data.length / 12) }
      };
    }

    const response = await apiClient.get('/articles', { params: filters });
    return response.data;
  },

  // Public Endpoint: get article by slug
  async getArticleBySlug(slug: string): Promise<{ success: boolean; message: string; data: Article }> {
    if (getApiMode() === 'mock') {
      const article = mockDb.getArticleBySlug(slug);
      if (!article) {
        throw {
          response: {
            status: 404,
            data: { success: false, message: 'Artikel tidak ditemukan', errors: { code: 'ARTICLE_NOT_FOUND' } }
          }
        };
      }
      return { success: true, message: 'Success', data: article };
    }

    const response = await apiClient.get(`/articles/${slug}`);
    return response.data;
  },

  // Admin Endpoint: list all articles (draft & published)
  async getAdminArticles(filters?: { status?: string; search?: string }): Promise<{ success: boolean; message: string; data: Article[]; meta?: any }> {
    if (getApiMode() === 'mock') {
      const data = mockDb.getArticles({ ...filters, status: filters?.status || 'ALL' });
      return {
        success: true,
        message: 'Success',
        data,
        meta: { page: 1, limit: 50, total: data.length, totalPages: Math.ceil(data.length / 50) }
      };
    }

    const response = await apiClient.get('/admin/articles', { params: filters });
    return response.data;
  },

  // Admin Endpoint: get admin article by id
  async getAdminArticleById(id: string): Promise<{ success: boolean; message: string; data: Article }> {
    if (getApiMode() === 'mock') {
      const article = mockDb.getArticleById(id);
      if (!article) {
        throw {
          response: {
            status: 404,
            data: { success: false, message: 'Artikel tidak ditemukan', errors: { code: 'ARTICLE_NOT_FOUND' } }
          }
        };
      }
      return { success: true, message: 'Success', data: article };
    }

    const response = await apiClient.get(`/admin/articles/${id}`);
    return response.data;
  },

  // Admin Endpoint: create article
  async createArticle(articleData: Omit<Article, 'id' | 'slug' | 'status' | 'readingTimeMinutes' | 'authorId' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; data: Article }> {
    if (getApiMode() === 'mock') {
      const data = mockDb.createArticle(articleData);
      return { success: true, message: 'Success', data };
    }

    const response = await apiClient.post('/admin/articles', articleData);
    return response.data;
  },

  // Admin Endpoint: update article
  async updateArticle(id: string, articleData: Partial<Article>): Promise<{ success: boolean; message: string; data: Article }> {
    if (getApiMode() === 'mock') {
      try {
        const data = mockDb.updateArticle(id, articleData);
        return { success: true, message: 'Success', data };
      } catch (err) {
        throw {
          response: {
            status: 404,
            data: { success: false, message: 'Artikel tidak ditemukan', errors: { code: 'ARTICLE_NOT_FOUND' } }
          }
        };
      }
    }

    const response = await apiClient.put(`/admin/articles/${id}`, articleData);
    return response.data;
  },

  // Admin Endpoint: patch status
  async updateArticleStatus(id: string, status: ArticleStatus): Promise<{ success: boolean; message: string; data: Article }> {
    if (getApiMode() === 'mock') {
      try {
        const data = mockDb.updateArticleStatus(id, status);
        return { success: true, message: 'Success', data };
      } catch (err: any) {
        throw {
          response: {
            status: 422,
            data: { success: false, message: err.message, errors: { code: 'ARTICLE_STATUS_ERROR' } }
          }
        };
      }
    }

    const response = await apiClient.patch(`/admin/articles/${id}/status`, { status });
    return response.data;
  },

  // Admin Endpoint: upload cover image
  async uploadCover(id: string, file: File): Promise<{ success: boolean; message: string; data: Article }> {
    if (getApiMode() === 'mock') {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const fallback = `https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800`;
          const updated = mockDb.updateArticle(id, { coverImage: dataUrl || fallback });
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

    const response = await apiClient.post(`/admin/articles/${id}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Admin Endpoint: delete article
  async deleteArticle(id: string): Promise<{ success: boolean; message: string; data: null }> {
    if (getApiMode() === 'mock') {
      try {
        mockDb.deleteArticle(id);
        return { success: true, message: 'Success', data: null };
      } catch (err) {
        throw {
          response: {
            status: 404,
            data: { success: false, message: 'Artikel tidak ditemukan', errors: { code: 'ARTICLE_NOT_FOUND' } }
          }
        };
      }
    }

    const response = await apiClient.delete(`/admin/articles/${id}`);
    return response.data;
  }
};
