/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './api-client';
import { Article, ArticleStatus } from '../types';

export const articlesService = {
  // Public Endpoint: get published articles
  async getArticles(filters?: { tag?: string; search?: string }): Promise<{ success: boolean; message: string; data: Article[]; meta?: any }> {
    const response = await apiClient.get('/articles', { params: filters });
    return response.data;
  },

  // Public Endpoint: get article by slug
  async getArticleBySlug(slug: string): Promise<{ success: boolean; message: string; data: Article }> {
    const response = await apiClient.get(`/articles/${slug}`);
    return response.data;
  },

  // Admin Endpoint: list all articles (draft & published)
  async getAdminArticles(filters?: { status?: string; search?: string }): Promise<{ success: boolean; message: string; data: Article[]; meta?: any }> {
    const response = await apiClient.get('/admin/articles', { params: filters });
    return response.data;
  },

  // Admin Endpoint: get admin article by id
  async getAdminArticleById(id: string): Promise<{ success: boolean; message: string; data: Article }> {
    const response = await apiClient.get(`/admin/articles/${id}`);
    return response.data;
  },

  // Admin Endpoint: create article
  async createArticle(articleData: Omit<Article, 'id' | 'slug' | 'status' | 'readingTimeMinutes' | 'authorId' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; data: Article }> {
    const response = await apiClient.post('/admin/articles', articleData);
    return response.data;
  },

  // Admin Endpoint: update article
  async updateArticle(id: string, articleData: Partial<Article>): Promise<{ success: boolean; message: string; data: Article }> {
    const response = await apiClient.put(`/admin/articles/${id}`, articleData);
    return response.data;
  },

  // Admin Endpoint: patch status
  async updateArticleStatus(id: string, status: ArticleStatus): Promise<{ success: boolean; message: string; data: Article }> {
    const response = await apiClient.patch(`/admin/articles/${id}/status`, { status });
    return response.data;
  },

  // Admin Endpoint: upload cover image
  async uploadCover(id: string, file: File): Promise<{ success: boolean; message: string; data: Article }> {
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
    const response = await apiClient.delete(`/admin/articles/${id}`);
    return response.data;
  }
};
