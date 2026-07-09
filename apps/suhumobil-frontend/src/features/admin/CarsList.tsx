/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Check, Eye, Trash2, Sliders, AlertCircle, Share2 } from 'lucide-react';
import { carsService } from '../../services/cars.service';
import { Car, CarStatus } from '../../types';
import { formatRupiah, formatDate } from '../../utils/format';
import ShareLinkModal from '../../components/ShareLinkModal';

export default function CarsList() {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Share link modal state
  const [selectedCarForShare, setSelectedCarForShare] = useState<Car | null>(null);

  useEffect(() => {
    fetchCars();
  }, [search, statusFilter]);

  const fetchCars = () => {
    setIsLoading(true);
    carsService.getAdminCars({
      status: statusFilter,
      search: search || undefined
    })
      .then(res => {
        if (res.success) {
          setCars(res.data);
        }
      })
      .catch(err => console.error('Error fetching admin cars:', err))
      .finally(() => setIsLoading(false));
  };

  const handleStatusTransition = async (carId: string, currentStatus: CarStatus, newStatus: CarStatus, imgCount: number) => {
    if (newStatus === CarStatus.PUBLISHED && imgCount < 5) {
      alert(`Gagal mempublikasikan: Unit membutuhkan minimal 5 foto terupload sebelum diterbitkan. Unit Anda baru memiliki ${imgCount} foto.`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin mengubah status unit ini menjadi ${newStatus}?`)) {
      try {
        const res = await carsService.updateCarStatus(carId, newStatus);
        if (res.success) {
          alert('Status unit berhasil diperbarui!');
          fetchCars();
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Gagal mengubah status kendaraan.';
        alert(msg);
      }
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (confirm('⚠️ PERINGATAN DESTRUKTIF:\nApakah Anda yakin ingin menghapus mobil ini secara permanen?\nSeluruh foto terkait yang tersimpan di Cloudflare R2 juga akan ikut dihapus seketika.')) {
      try {
        const res = await carsService.deleteCar(id);
        if (res.success) {
          alert('Unit mobil beserta seluruh fotonya berhasil dihapus!');
          fetchCars();
        }
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus unit.');
      }
    }
  };

  const getStatusBadge = (status: CarStatus) => {
    switch (status) {
      case CarStatus.DRAFT:
        return <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">Draft</span>;
      case CarStatus.PUBLISHED:
        return <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md uppercase border border-green-200">Published</span>;
      case CarStatus.SOLD:
        return <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md uppercase border border-amber-200">Sold</span>;
      case CarStatus.ARCHIVED:
        return <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md uppercase border border-red-200">Archived</span>;
      default:
        return null;
    }
  };

  // Determine allowed transitions from current status
  const getAllowedStatuses = (current: CarStatus): CarStatus[] => {
    switch (current) {
      case CarStatus.DRAFT:
        return [CarStatus.PUBLISHED, CarStatus.ARCHIVED];
      case CarStatus.PUBLISHED:
        return [CarStatus.SOLD, CarStatus.ARCHIVED];
      case CarStatus.SOLD:
        return [CarStatus.PUBLISHED];
      case CarStatus.ARCHIVED:
        return [CarStatus.PUBLISHED];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header action row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Katalog Unit Kendaraan</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola listing mobil terkurasi, status bursa, dan upload galeri foto</p>
        </div>
        <Link
          to="/admin/cars/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow"
        >
          <Plus size={16} /> Tambah Mobil Baru
        </Link>
      </div>

      {/* FILTER SEARCH BAR BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="sm:col-span-2 relative flex items-center">
          <input
            type="text"
            placeholder="Cari berdasarkan merek, model atau judul unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 transition text-xs"
          />
          <Search size={14} className="absolute left-3 text-slate-400" />
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-1.5">
          <Sliders size={14} className="text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none text-xs bg-white font-sans font-semibold text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="SOLD">SOLD</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      {/* INVENTORY TABLE */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 animate-pulse">
          <div className="h-6 w-full bg-slate-100 rounded" />
          <div className="h-20 w-full bg-slate-50 rounded" />
          <div className="h-20 w-full bg-slate-50 rounded" />
        </div>
      ) : cars.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-2">
          <p className="text-slate-400 text-sm">Tidak ada unit kendaraan yang sesuai dengan kriteria filter.</p>
          <Link to="/admin/cars/new" className="text-amber-600 hover:text-amber-700 font-semibold text-xs inline-block underline">
            Mulai tambah unit pertama Anda sekarang
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-6 w-16">Cover</th>
                  <th className="py-3.5 px-4">Nama Unit / Spek</th>
                  <th className="py-3.5 px-4 w-32">Harga</th>
                  <th className="py-3.5 px-4 w-28">Status</th>
                  <th className="py-3.5 px-4 w-24 text-center">Foto</th>
                  <th className="py-3.5 px-4 w-24">Tanggal Input</th>
                  <th className="py-3.5 px-6 w-32 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {cars.map((car) => {
                  const cover = car.images?.find(img => img.isCover) || car.images?.[0];
                  const imgCount = car.images?.length || 0;
                  const allowedTransitions = getAllowedStatuses(car.status);

                  return (
                    <tr key={car.id} className="hover:bg-slate-50/55 transition-colors">
                      {/* Photo Thumbnail */}
                      <td className="py-3 px-6">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border overflow-hidden flex items-center justify-center shrink-0">
                          {cover ? (
                            <img src={cover.url} alt="cover" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] text-slate-400 text-center uppercase font-bold tracking-wider">No Pic</span>
                          )}
                        </div>
                      </td>

                      {/* Name Details */}
                      <td className="py-3 px-4 space-y-0.5">
                        <Link to={`/cars/${car.slug}`} target="_blank" className="font-semibold text-slate-900 text-sm hover:text-amber-600 transition truncate block max-w-xs">
                          {car.title}
                        </Link>
                        <p className="text-[10px] text-slate-400 font-sans">
                          {car.brand} &middot; {car.transmission} &middot; {car.fuelType} &middot; {car.location}
                        </p>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-slate-950 font-display">
                        {formatRupiah(car.price)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <div className="space-y-1.5">
                          {getStatusBadge(car.status)}

                          {/* Quick transitions options if available */}
                          {allowedTransitions.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {allowedTransitions.map((t) => (
                                <button
                                  key={t}
                                  onClick={() => handleStatusTransition(car.id, car.status, t, imgCount)}
                                  className="text-[9px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-semibold capitalize active:scale-95 transition"
                                >
                                  Ke {t.toLowerCase()}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Image Count Check */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`font-mono font-bold text-xs ${imgCount < 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                            {imgCount} / 20
                          </span>
                          {imgCount < 5 && car.status === CarStatus.DRAFT && (
                            <span className="text-[9px] text-red-400 font-sans block flex items-center gap-0.5 leading-none mt-1">
                              <AlertCircle size={10} /> Butuh &ge;5
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Input date */}
                      <td className="py-3 px-4 text-slate-400 text-[10px] font-mono leading-relaxed">
                        {formatDate(car.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-6 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedCarForShare(car)}
                            className="p-1.5 rounded-lg border border-amber-100 hover:bg-amber-50 text-amber-600 transition"
                            title="Salin Link Pelacakan"
                          >
                            <Share2 size={13} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/cars/${car.id}/edit`)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                            title="Edit Unit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteCar(car.id)}
                            className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-600 transition"
                            title="Hapus Unit"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Share/Tracking Link Modal */}
      {selectedCarForShare && (
        <ShareLinkModal
          isOpen={true}
          onClose={() => setSelectedCarForShare(null)}
          carId={selectedCarForShare.id}
          carSlug={selectedCarForShare.slug}
          carTitle={selectedCarForShare.title}
        />
      )}
    </div>
  );
}
