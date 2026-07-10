/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './api-client';

export interface BackupListItem {
  key: string;
  sizeBytes: number;
  lastModified: string;
}

export const RESTORE_CONFIRMATION_TEXT = 'SUHUMOBIL RESTORE';

export const backupService = {
  // Admin Endpoint (OWNER only): trigger export, returns a signed download URL
  async exportBackup(): Promise<{ success: boolean; message: string; data: { key: string; sizeBytes: number; downloadUrl: string; expiresInSeconds: number } }> {
    const response = await apiClient.post('/admin/backup/export');
    return response.data;
  },

  // Admin Endpoint (OWNER only): list backup history
  async listBackups(): Promise<{ success: boolean; message: string; data: BackupListItem[] }> {
    const response = await apiClient.get('/admin/backup/list');
    return response.data;
  },

  // Admin Endpoint (OWNER only) — DESTRUCTIVE: restore database from an uploaded .dump file
  async restoreBackup(file: File, confirmationText: string): Promise<{ success: boolean; message: string; data: null }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('confirmationText', confirmationText);

    // 🔧 FIX: jangan hardcode 'multipart/form-data' (tidak ada boundary → gagal diparse backend).
    const response = await apiClient.post('/admin/backup/restore', formData, {
      headers: { 'Content-Type': undefined }
    });
    return response.data;
  }
};
