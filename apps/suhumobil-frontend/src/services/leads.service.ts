/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient, getApiMode } from './api-client';
import { mockDb } from './mock-db';
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
    if (getApiMode() === 'mock') {
      const savedLead = mockDb.createLead({
        ...leadData,
        carId: leadData.carId || undefined
      });
      return {
        success: true,
        message: 'Success',
        data: { id: savedLead.id, status: savedLead.status }
      };
    }

    const response = await apiClient.post('/leads', leadData);
    return response.data;
  },

  // Admin Endpoint: get list of leads
  async getLeads(filters?: { status?: string; source?: string; search?: string }): Promise<{ success: boolean; message: string; data: Lead[]; meta?: any }> {
    if (getApiMode() === 'mock') {
      const data = mockDb.getLeads(filters);
      // Try to join car details if carId is present
      const joinedData = data.map(l => {
        if (l.carId) {
          const car = mockDb.getCarById(l.carId);
          return { ...l, car };
        }
        return l;
      });

      return {
        success: true,
        message: 'Success',
        data: joinedData,
        meta: { page: 1, limit: 50, total: joinedData.length, totalPages: Math.ceil(joinedData.length / 50) }
      };
    }

    const response = await apiClient.get('/admin/leads', { params: filters });
    return response.data;
  },

  // Admin Endpoint: get single lead detail
  async getLeadById(id: string): Promise<{ success: boolean; message: string; data: Lead }> {
    if (getApiMode() === 'mock') {
      const lead = mockDb.getLeadById(id);
      if (!lead) {
        throw {
          response: {
            status: 404,
            data: { success: false, message: 'Lead tidak ditemukan', errors: { code: 'LEAD_NOT_FOUND' } }
          }
        };
      }
      if (lead.carId) {
        lead.car = mockDb.getCarById(lead.carId);
      }
      return { success: true, message: 'Success', data: lead };
    }

    const response = await apiClient.get(`/admin/leads/${id}`);
    return response.data;
  },

  // Admin Endpoint: update lead status & notes
  async updateLead(id: string, updateData: { status: LeadStatus; notes?: string }): Promise<{ success: boolean; message: string; data: Lead }> {
    if (getApiMode() === 'mock') {
      try {
        const lead = mockDb.updateLeadStatus(id, updateData.status, updateData.notes);
        return { success: true, message: 'Success', data: lead };
      } catch (err) {
        throw {
          response: {
            status: 404,
            data: { success: false, message: 'Lead tidak ditemukan', errors: { code: 'LEAD_NOT_FOUND' } }
          }
        };
      }
    }

    const response = await apiClient.patch(`/admin/leads/${id}`, updateData);
    return response.data;
  }
};
