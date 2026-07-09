/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { DatabaseBackup, Download, Upload, AlertTriangle, X } from 'lucide-react';
import { backupService, BackupListItem, RESTORE_CONFIRMATION_TEXT } from '../../services/backup.service';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = () => {
    setIsLoading(true);
    backupService.listBackups()
      .then(res => {
        if (res.success) setBackups(res.data);
      })
      .catch(err => console.error('Error fetching backups:', err))
      .finally(() => setIsLoading(false));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await backupService.exportBackup();
      if (res.success) {
        window.open(res.data.downloadUrl, '_blank');
        alert(`Backup berhasil dibuat (${formatBytes(res.data.sizeBytes)}). Link download dibuka di tab baru, berlaku ${Math.round(res.data.expiresInSeconds / 60)} menit.`);
        fetchBackups();
      }
    } catch (err: any) {
      console.error('Error exporting backup:', err);
      alert(err.response?.data?.message || 'Gagal membuat backup.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      alert('Pilih file .dump terlebih dahulu!');
      return;
    }
    if (confirmationInput !== RESTORE_CONFIRMATION_TEXT) {
      alert(`Teks konfirmasi tidak cocok. Ketik persis: ${RESTORE_CONFIRMATION_TEXT}`);
      return;
    }

    setIsRestoring(true);
    try {
      const res = await backupService.restoreBackup(restoreFile, confirmationInput);
      if (res.success) {
        alert('Restore berhasil! Semua sesi login (termasuk sesi Anda) telah di-invalidate — silakan login ulang.');
        window.location.href = '#/admin/login';
        window.location.reload();
      }
    } catch (err: any) {
      console.error('Error restoring backup:', err);
      alert(err.response?.data?.message || 'Gagal melakukan restore.');
    } finally {
      setIsRestoring(false);
      setIsRestoreModalOpen(false);
      setRestoreFile(null);
      setConfirmationInput('');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
          <DatabaseBackup className="text-amber-500" size={24} />
          Backup & Restore
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Khusus role OWNER. Backup otomatis menyimpan 7 riwayat terakhir.</p>
      </div>

      {/* Export card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-display font-bold text-sm text-slate-900">Export Database</h3>
          <p className="text-xs text-slate-500 mt-0.5">Buat backup baru dan dapatkan link download (berlaku 10 menit).</p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow shrink-0"
        >
          <Download size={16} /> {isExporting ? 'Membuat Backup...' : 'Export Sekarang'}
        </button>
      </div>

      {/* Restore card */}
      <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-red-500" /> Restore Database
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">⚠️ Destruktif — akan menimpa seluruh data saat ini. Semua sesi login akan di-invalidate.</p>
        </div>
        <button
          onClick={() => setIsRestoreModalOpen(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow shrink-0"
        >
          <Upload size={16} /> Restore dari File
        </button>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-display font-bold text-sm text-slate-900">Riwayat Backup</h3>
        </div>
        {isLoading ? (
          <div className="min-h-[15vh] flex items-center justify-center text-slate-400 text-xs">Memuat riwayat...</div>
        ) : backups.length === 0 ? (
          <div className="min-h-[15vh] flex items-center justify-center text-slate-400 text-xs">Belum ada backup.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">Nama File</th>
                <th className="py-3 px-4">Ukuran</th>
                <th className="py-3 px-6">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.map((b) => (
                <tr key={b.key}>
                  <td className="py-3 px-6 font-mono text-slate-700">{b.key.split('/').pop()}</td>
                  <td className="py-3 px-4 text-slate-500">{formatBytes(b.sizeBytes)}</td>
                  <td className="py-3 px-6 text-slate-500">{new Date(b.lastModified).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Restore confirmation modal */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsRestoreModalOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />

          <div className="relative bg-white rounded-2xl shadow-2xl border border-red-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50">
              <h2 className="font-display font-bold text-red-700 text-sm tracking-tight flex items-center gap-1.5">
                <AlertTriangle size={18} /> Konfirmasi Restore Destruktif
              </h2>
              <button onClick={() => setIsRestoreModalOpen(false)} className="p-1 rounded-lg text-red-400 hover:bg-red-100 transition">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Tindakan ini akan <strong>menimpa seluruh data saat ini</strong> dengan isi file backup yang dipilih,
                dan me-logout semua pengguna (termasuk Anda). Tindakan ini <strong>tidak bisa dibatalkan</strong>.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">File Backup (.dump)</label>
                <input
                  type="file"
                  accept=".dump"
                  onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                  className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200 cursor-pointer w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Ketik <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{RESTORE_CONFIRMATION_TEXT}</span> untuk konfirmasi
                </label>
                <input
                  type="text"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  placeholder={RESTORE_CONFIRMATION_TEXT}
                  className="px-3 py-2 border border-red-200 rounded-xl outline-none text-xs focus:ring-1 focus:ring-red-500 transition font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsRestoreModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleRestore}
                  disabled={isRestoring || confirmationInput !== RESTORE_CONFIRMATION_TEXT || !restoreFile}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition shadow"
                >
                  {isRestoring ? 'Merestore...' : 'Ya, Timpa Semua Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
