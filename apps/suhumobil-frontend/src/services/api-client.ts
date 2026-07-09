/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';

// Get default from Vite's env standard, or Next public variable fallback
const metaEnv = (import.meta as any).env || {};
const DEFAULT_API_URL =
  metaEnv.VITE_API_BASE_URL ||
  metaEnv.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:4000/api/v1';

// 🗑️ getApiMode / setApiMode DIHAPUS (Bug Fix #3, addendum 09 Section 5) — tidak ada lagi mode mock/sandbox.

export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('suhumobil_api_url') || DEFAULT_API_URL;
  }
  return DEFAULT_API_URL;
}

export function setApiUrl(url: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('suhumobil_api_url', url);
    window.dispatchEvent(new Event('suhumobil_api_config_changed'));
  }
}

// Create a configured axios instance
export const apiClient = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // Crucial for HttpOnly JWT cookies (04-api-contract.md section 5)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update base URL dynamically when settings change
if (typeof window !== 'undefined') {
  window.addEventListener('suhumobil_api_config_changed', () => {
    apiClient.defaults.baseURL = getApiUrl();
  });
}
