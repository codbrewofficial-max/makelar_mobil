/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { curatorsService } from '../services/curators.service';
import { Curator } from '../types';

interface CuratorSelectProps {
  value: string | null | undefined;
  onChange: (curatorId: string | null) => void;
  label?: string;
}

// Dropdown "Kurator Pemeriksa" — addendum 09 Section 7.2.
// Drop this into any admin form (e.g. CarFormPage.tsx) that needs to link a
// record to one of the curators managed in /admin/curators.
export default function CuratorSelect({ value, onChange, label = 'Kurator Pemeriksa' }: CuratorSelectProps) {
  const [curators, setCurators] = useState<Curator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    curatorsService.getCurators()
      .then(res => {
        if (res.success) setCurators(res.data);
      })
      .catch(err => console.error('Error fetching curators for select:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-700">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={isLoading}
        className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:ring-1 focus:ring-amber-500 transition bg-white disabled:opacity-50"
      >
        <option value="">— Belum dipilih —</option>
        {curators.map((c) => (
          <option key={c.id} value={c.id}>{c.name} ({c.role || 'Kurator Utama'})</option>
        ))}
      </select>
    </div>
  );
}
