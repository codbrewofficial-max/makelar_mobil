/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './api-client';

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  user: { id: string; name: string; email: string } | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export const auditLogsService = {
  // Admin Endpoint (OWNER only): list/filter audit trail
  async listAuditLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    entity?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ success: boolean; message: string; data: AuditLogEntry[]; meta?: any }> {
    const response = await apiClient.get('/admin/audit-logs', { params });
    return response.data;
  }
};
