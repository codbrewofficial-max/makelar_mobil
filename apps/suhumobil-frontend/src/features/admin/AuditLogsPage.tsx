/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { History, Search } from 'lucide-react';
import { auditLogsService, AuditLogEntry } from '../../services/audit-logs.service';

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  UPDATE: 'text-amber-700 bg-amber-50 border-amber-200',
  DELETE: 'text-red-700 bg-red-50 border-red-200',
  LOGIN: 'text-slate-700 bg-slate-100 border-slate-200',
  LOGIN_FAILED: 'text-red-700 bg-red-50 border-red-200',
  LOGOUT: 'text-slate-700 bg-slate-100 border-slate-200',
  RESTORE: 'text-red-700 bg-red-100 border-red-300',
  EXPORT: 'text-blue-700 bg-blue-50 border-blue-200'
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter, page]);

  const fetchLogs = () => {
    setIsLoading(true);
    auditLogsService.listAuditLogs({
      page,
      limit: 20,
      action: actionFilter || undefined,
      entity: entityFilter || undefined
    })
      .then(res => {
        if (res.success) {
          setLogs(res.data);
          setMeta(res.meta);
        }
      })
      .catch(err => console.error('Error fetching audit logs:', err))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
          <History className="text-amber-500" size={24} />
          Log Aktivitas
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Khusus role OWNER. Riwayat semua aksi penting di sistem.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-xs bg-white"
        >
          <option value="">Semua Aksi</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="LOGIN_FAILED">Login Gagal</option>
          <option value="LOGOUT">Logout</option>
          <option value="RESTORE">Restore</option>
          <option value="EXPORT">Export</option>
        </select>
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-xs bg-white"
        >
          <option value="">Semua Entitas</option>
          <option value="car">Mobil</option>
          <option value="curator">Kurator</option>
          <option value="article">Artikel</option>
          <option value="settings">Settings</option>
          <option value="content_section">Konten Halaman</option>
          <option value="media_asset">Media</option>
          <option value="database">Database</option>
          <option value="auth">Auth</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="min-h-[30vh] flex flex-col justify-center items-center text-slate-500 font-sans gap-3 animate-pulse">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span>Memuat log aktivitas...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="min-h-[20vh] flex items-center justify-center text-slate-400 text-xs">Tidak ada log yang sesuai filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Waktu</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Entitas</th>
                  <th className="py-3 px-4">IP</th>
                  <th className="py-3 px-6">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-6 text-slate-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{log.user?.name || <span className="text-slate-400 italic">Sistem</span>}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${ACTION_COLORS[log.action] || 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 capitalize">{log.entity.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{log.ipAddress || '-'}</td>
                    <td className="py-3 px-6 text-slate-400 font-mono text-[10px] max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
          >
            Sebelumnya
          </button>
          <span className="text-xs text-slate-500 font-mono">Halaman {meta.page} / {meta.totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
            disabled={page >= meta.totalPages}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
}
