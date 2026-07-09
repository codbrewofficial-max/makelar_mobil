/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './api-client';
import { Lead, LeadStatus, LeadSource, LeadSubject } from '../types';

export const leadsService = {
  // Public Endpoint: create lead (submit contact or Whatsapp FAB or CTA popup)
  async createLead(leadData: {
    name: string;
    phone: string;
    email?: string;
    city?: string;
    budget?: number;
    carInterest?: string;
    subject?: LeadSubject;
    message?: string;
    carId?: string | null;
    source: LeadSource;
  }): Promise<{ success: boolean; message: string; data: { id: string; status: LeadStatus } }> {
    const response = await apiClient.post('/leads', leadData);
    return response.data;
  },

  // Admin Endpoint: get list of leads
  async getLeads(filters?: { status?: string; source?: string; search?: string }): Promise<{ success: boolean; message: string; data: Lead[]; meta?: any }> {
    const response = await apiClient.get('/admin/leads', { params: filters });
    return response.data;
  },

  // Admin Endpoint: get single lead detail
  async getLeadById(id: string): Promise<{ success: boolean; message: string; data: Lead }> {
    const response = await apiClient.get(`/admin/leads/${id}`);
    return response.data;
  },

  // Admin Endpoint: update lead status & notes
  async updateLead(id: string, updateData: { status: LeadStatus; notes?: string }): Promise<{ success: boolean; message: string; data: Lead }> {
    const response = await apiClient.patch(`/admin/leads/${id}`, updateData);
    return response.data;
  }
};
