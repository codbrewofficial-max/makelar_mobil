/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ImagePlus, Upload, Link as LinkIcon, Sparkles, Trash2, X, Copy, Check } from 'lucide-react';
import { mediaService, MediaAsset } from '../../services/media.service';

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = () => {
    setIsLoading(true);
    mediaService.listMedia({ page: 1, limit: 48 })
      .then(res => {
        if (res.success) setAssets(res.data);
      })
      .catch(err => console.error('Error fetching media:', err))
      .finally(() => setIsLoading(false));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      const res = await mediaService.uploadMedia(file);
      if (res.success) {
        setAssets(prev => [res.data, ...prev]);
        setIsUploadModalOpen(false);
      }
    } catch (err: any) {
      console.error('Error uploading media:', err);
      alert(err.response?.data?.message || 'Gagal mengunggah media.');
    } finally {
      setIsSaving(false);
      e.target.value = '';
    }
  };

  const handleAddLink = async () => {
    if (!linkInput.trim()) {
      alert('URL wajib diisi!');
      return;
    }
    setIsSaving(true);
    try {
      const res = await mediaService.createMediaLink(linkInput.trim());
      if (res.success) {
        setAssets(prev => [res.data, ...prev]);
        setLinkInput('');
        setIsUploadModalOpen(false);
      }
    } catch (err: any) {
      console.error('Error adding media link:', err);
      alert(err.response?.data?.message || 'Gagal menambahkan link. Pastikan URL valid.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus media ini? Aksi ini tidak bisa dibatalkan.')) {
      try {
        const res = await mediaService.deleteMedia(id);
        if (res.success) {
          setAssets(prev => prev.filter(a => a.id !== id));
        }
      } catch (err) {
        console.error('Error deleting media:', err);
        alert('Gagal menghapus media.');
      }
    }
  };

  const handleCopyUrl = async (asset: MediaAsset) => {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopiedId(asset.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Error copying URL:', err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            <ImagePlus className="text-amber-500" size={24} />
            Media Library
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola semua gambar yang bisa dipakai ulang di seluruh bagian admin.</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow"
        >
          <Upload size={16} /> Tambah Media
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="min-h-[30vh] flex flex-col justify-center items-center text-slate-500 font-sans gap-3 animate-pulse">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Memuat media...</span>
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <ImagePlus size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm font-sans font-medium">Belum ada media tersimpan.</p>
          <p className="text-slate-400 text-xs mt-1">Klik "Tambah Media" untuk mulai mengunggah atau menautkan gambar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {assets.map((asset) => (
            <div key={asset.id} className="relative bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
              <div className="aspect-square bg-slate-100 overflow-hidden">
                <img src={asset.url} alt={asset.altText || 'media'} className="w-full h-full object-cover" />
              </div>
              <div className="p-2 flex items-center justify-between gap-1 border-t border-slate-100">
                <span className="text-[9px] uppercase font-mono font-bold text-slate-400 truncate">
                  {asset.sourceType === 'UPLOAD' ? 'Upload' : asset.sourceType === 'EXTERNAL_LINK' ? 'Link' : 'AI'}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => handleCopyUrl(asset)}
                    className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded transition"
                    title="Salin URL"
                  >
                    {copiedId === asset.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-1 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded transition"
                    title="Hapus"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload/Link/Generate Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsUploadModalOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />

          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-display font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                <ImagePlus className="text-amber-500" size={18} /> Tambah Media Baru
              </h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Option 1: Upload */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><Upload size={14} className="text-amber-500" /> Upload dari Perangkat</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  disabled={isSaving}
                  className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer w-full"
                />
              </div>

              {/* Option 2: Custom Link */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><LinkIcon size={14} className="text-amber-500" /> Link Custom</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/gambar.jpg"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-xs focus:ring-1 focus:ring-amber-500 transition"
                  />
                  <button
                    onClick={handleAddLink}
                    disabled={isSaving}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              {/* Option 3: Generate AI (disabled) */}
              <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl space-y-1 opacity-60">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Sparkles size={14} /> Generate Gambar (AI)</span>
                <p className="text-[10px] text-slate-400">Segera hadir — provider AI generation belum dikonfigurasi.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
