/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  Save,
  X,
  User,
  Image as ImageIcon
} from 'lucide-react';
import { curatorsService } from '../../services/curators.service';
import { Curator } from '../../types';

export default function CuratorsList() {
  const [curators, setCurators] = useState<Curator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurator, setEditingCurator] = useState<Curator | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 🆕 Bug Fix #1 (addendum 09): file foto yang menunggu diupload untuk kurator BARU
  // (belum punya id sampai create sukses). Untuk kurator existing, upload langsung terjadi
  // di handlePhotoUpload tanpa butuh state ini.
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    role: 'Kurator Utama',
    photoUrl: '',
    description: ''
  });

  useEffect(() => {
    fetchCurators();
  }, [search]);

  const fetchCurators = () => {
    setIsLoading(true);
    curatorsService.getCurators({ search: search || undefined })
      .then(res => {
        if (res.success) {
          setCurators(res.data);
        }
      })
      .catch(err => console.error('Error fetching curators:', err))
      .finally(() => setIsLoading(false));
  };

  const handleOpenAdd = () => {
    setEditingCurator(null);
    setPendingPhotoFile(null); // 🆕
    setFormData({
      name: '',
      role: 'Kurator Utama',
      photoUrl: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (curator: Curator) => {
    setEditingCurator(curator);
    setPendingPhotoFile(null); // 🆕
    setFormData({
      name: curator.name,
      role: curator.role || 'Kurator Utama',
      photoUrl: curator.photoUrl || '',
      description: curator.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('⚠️ PERINGATAN HAPUS:\nApakah Anda yakin ingin menghapus Kurator Utama ini?')) {
      try {
        const res = await curatorsService.deleteCurator(id);
        if (res.success) {
          alert('Data Kurator Utama berhasil dihapus!');
          fetchCurators();
        }
      } catch (err) {
        console.error('Error deleting curator:', err);
        alert('Gagal menghapus Kurator Utama.');
      }
    }
  };

  // 🔧 FIXED (Bug Fix #1, addendum 09 Section 3): sebelumnya file di-convert ke base64 dan
  // dititipkan di body JSON create/update — tidak pernah lewat endpoint upload/R2 yang sebenarnya.
  // Sekarang: preview lokal pakai object URL, lalu upload sungguhan lewat curatorsService.uploadPhoto().
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview lokal saja - upload sungguhan terjadi di bawah.
    setFormData(prev => ({ ...prev, photoUrl: URL.createObjectURL(file) }));

    if (editingCurator) {
      // Kurator existing: sudah punya id, langsung upload sekarang juga.
      curatorsService.uploadPhoto(editingCurator.id, file)
        .then(res => {
          if (res.success) setFormData(prev => ({ ...prev, photoUrl: res.data.photoUrl || '' }));
        })
        .catch(err => {
          console.error('Error uploading curator photo:', err);
          alert('Gagal mengunggah foto kurator.');
        });
    } else {
      // Kurator baru: belum ada id, upload ditunda sampai setelah create sukses (lihat handleSubmit).
      setPendingPhotoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama kurator wajib diisi!');
      return;
    }
    if (!formData.description.trim()) {
      alert('Deskripsi/Biografi kurator wajib diisi!');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCurator) {
        // Update — TIDAK lagi kirim photoUrl di body (foto sudah terupload langsung via handlePhotoUpload
        // ke endpoint multipart yang benar, bukan dititipkan sebagai base64 di JSON ini).
        const res = await curatorsService.updateCurator(editingCurator.id, {
          name: formData.name,
          role: formData.role,
          description: formData.description
        });
        if (res.success) {
          alert('Data Kurator Utama berhasil diperbarui!');
          setIsModalOpen(false);
          fetchCurators();
        }
      } else {
        // Create — photoUrl SELALU null saat create (sesuai kontrak backend, foto diupload terpisah).
        const res = await curatorsService.createCurator({
          name: formData.name,
          role: formData.role,
          description: formData.description
        });
        if (res.success) {
          if (pendingPhotoFile) {
            await curatorsService.uploadPhoto(res.data.id, pendingPhotoFile).catch(err =>
              console.error('Error uploading photo for new curator:', err)
            );
            setPendingPhotoFile(null);
          }
          alert('Kurator Utama baru berhasil ditambahkan!');
          setIsModalOpen(false);
          fetchCurators();
        }
      }
    } catch (err) {
      console.error('Error saving curator:', err);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header action row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-amber-500" size={24} />
            Kurator Utama
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola tim kurator ahli dan teknisi senior yang melakukan inspeksi unit SuhuMobil</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow"
        >
          <Plus size={16} /> Tambah Kurator Baru
        </button>
      </div>

      {/* FILTER SEARCH GRID */}
      <div className="flex gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            placeholder="Cari berdasarkan nama, deskripsi, atau peran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 transition text-xs"
          />
          <Search size={14} className="absolute left-3 text-slate-400" />
        </div>
      </div>

      {/* LIST GRID */}
      {isLoading ? (
        <div className="min-h-[30vh] flex flex-col justify-center items-center text-slate-500 font-sans gap-3 animate-pulse">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Memuat data kurator...</span>
        </div>
      ) : curators.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <User size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm font-sans font-medium">Belum ada data kurator.</p>
          <p className="text-slate-400 text-xs mt-1">Silakan tambahkan kurator utama baru untuk bursa Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {curators.map((curator) => (
            <div
              key={curator.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row gap-5 shadow-sm hover:shadow-md transition duration-150"
            >
              {/* Photo Area */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100 shadow-sm self-start">
                <img
                  src={curator.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=500'}
                  alt={curator.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Body Content */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-display font-bold text-base text-slate-900">{curator.name}</h3>
                      <span className="text-[10px] uppercase font-mono font-bold text-amber-600 tracking-wider">
                        {curator.role || 'Kurator Utama'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed pt-1.5 whitespace-pre-line font-sans">
                    {curator.description}
                  </p>
                </div>

                {/* Actions bottom bar */}
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => handleOpenEdit(curator)}
                    className="p-1.5 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-lg transition duration-100"
                    title="Edit Profil"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(curator.id)}
                    className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition duration-100"
                    title="Hapus Profil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-display font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                <ShieldCheck className="text-amber-500" size={18} />
                {editingCurator ? 'Edit Data Kurator Utama' : 'Tambah Kurator Utama Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              {/* Photo Upload Area */}
              <div className="flex items-center gap-5 pb-3 border-b border-slate-100">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={20} className="text-slate-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-700 block">Foto Kurator</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="curator-photo-file"
                  />
                  <label
                    htmlFor="curator-photo-file"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer transition border border-slate-200 inline-block"
                  >
                    Unggah Foto
                  </label>
                  <p className="text-[9px] text-slate-400">Rekomendasi rasio persegi (1:1), maks 2MB</p>
                </div>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Nama Lengkap Kurator *</label>
                <input
                  type="text"
                  placeholder="Contoh: Suhu Benny Susilo"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-xs focus:ring-1 focus:ring-amber-500 transition"
                  required
                />
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Jabatan / Peran *</label>
                <input
                  type="text"
                  placeholder="Contoh: Kurator Utama"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-xs focus:ring-1 focus:ring-amber-500 transition"
                  required
                />
              </div>

              {/* Description / Bio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Deskripsi / Biografi / Kutipan *</label>
                <textarea
                  placeholder="Tuliskan pengalaman lapangan kurator, prinsip kurasi bursa, visi transparansi bursa, atau kata-kata bijak tentang kejujuran kondisi mobil..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-xs focus:ring-1 focus:ring-amber-500 transition leading-relaxed resize-none"
                  required
                />
              </div>

              {/* Footer Actions inside Modal */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow"
                >
                  <Save size={14} />
                  {isSaving ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
