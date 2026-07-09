/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatRupiah(value: number | bigint): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatMileage(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal'
  }).format(value) + ' km';
}

export function formatDate(isoString: string): string {
  if (!isoString) return '';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(isoString));
}
