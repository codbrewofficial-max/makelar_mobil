/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Search, User2, MessageSquare, Phone, Mail, Calendar, HelpCircle, Save, ExternalLink } from 'lucide-react';
import { leadsService } from '../../services/leads.service';
import { Lead, LeadStatus, LeadSource } from '../../types';
import { formatDate, formatRupiah } from '../../utils/format';

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');

  // Selected lead for detail Drawer view
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadStatus, setLeadStatus] = useState<LeadStatus>(LeadStatus.NEW);
  const [leadNotes, setLeadNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, sourceFilter]);

  const fetchLeads = () => {
    setIsLoading(true);
    leadsService.getLeads({
      status: statusFilter,
      source: sourceFilter,
      search: search || undefined
    })
      .then(res => {
        if (res.success) {
          setLeads(res.data);
        }
      })
      .catch(err => console.error('Error fetching leads:', err))
      .finally(() => setIsLoading(false));
  };

  const handleOpenLeadDrawer = (lead: Lead) => {
    setSelectedLead(lead);
    setLeadStatus(lead.status);
    setLeadNotes(lead.notes || '');
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;
    setIsUpdating(true);
    try {
      const res = await leadsService.updateLead(selectedLead.id, {
        status: leadStatus,
        notes: leadNotes
      });
      if (res.success) {
        alert('Data follow-up lead berhasil diperbarui!');
        setSelectedLead({
          ...selectedLead,
          status: leadStatus,
          notes: leadNotes
        });
        fetchLeads(); // Reload table
      }
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui data follow-up.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getSourceBadge = (source: LeadSource) => {
    switch (source) {
      case LeadSource.WHATSAPP_CTA:
        return <span className="inline-flex items-center gap-1 font-sans text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">WA CTA Popup</span>;
      case LeadSource.WHATSAPP_FAB:
        return <span className="inline-flex items-center gap-1 font-sans text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">WA Floating FAB</span>;
      case LeadSource.DREAM_CAR_FORM:
        return <span className="inline-flex items-center gap-1 font-sans text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Cari Mobil Form</span>;
      case LeadSource.CONTACT_PAGE:
        return <span className="inline-flex items-center gap-1 font-sans text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Contact Form</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW:
        return <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-150 animate-pulse">NEW</span>;
      case LeadStatus.CONTACTED:
        return <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-150">CONTACTED</span>;
      case LeadStatus.NEGOTIATION:
        return <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-150">NEGOTIATION</span>;
      case LeadStatus.CLOSED:
        return <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-150">CLOSED</span>;
      case LeadStatus.REJECTED:
        return <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">REJECTED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 relative">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Prospek & Konsultasi (Leads)</h1>
        <p className="text-xs text-slate-500 mt-0.5">Pantau formulir konsultasi yang masuk, hubungi kembali pelanggan, dan perbarui status negosiasi</p>
      </div>

      {/* FILTER SEARCH GRID GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm items-center">
        {/* Search */}
        <div className="sm:col-span-2 relative flex items-center">
          <input
            type="text"
            placeholder="Cari berdasarkan nama pengirim atau nomor telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 transition text-xs"
          />
          <Search size={14} className="absolute left-3 text-slate-400" />
        </div>

        {/* Filter Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none text-xs bg-white font-sans font-semibold text-slate-700"
          >
            <option value="ALL">Semua Status Follow-Up</option>
            <option value="NEW">NEW (Baru)</option>
            <option value="CONTACTED">CONTACTED (Dihubungi)</option>
            <option value="NEGOTIATION">NEGOTIATION (Tawar Menawar)</option>
            <option value="CLOSED">CLOSED (Closing/Terjual)</option>
            <option value="REJECTED">REJECTED (Batal)</option>
          </select>
        </div>

        {/* Filter Source */}
        <div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none text-xs bg-white font-sans font-semibold text-slate-700"
          >
            <option value="ALL">Semua Sumber Formulir</option>
            <option value="WHATSAPP_CTA">WA CTA Popup</option>
            <option value="WHATSAPP_FAB">WA Floating FAB</option>
            <option value="DREAM_CAR_FORM">Cari Mobil Form</option>
            <option value="CONTACT_PAGE">Contact Form</option>
          </select>
        </div>
      </div>

      {/* LEADS LIST TABLE */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 animate-pulse">
          <div className="h-6 w-full bg-slate-100 rounded" />
          <div className="h-20 w-full bg-slate-50 rounded" />
          <div className="h-20 w-full bg-slate-50 rounded" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 font-sans text-sm">
          Belum ada data prospek pengirim yang sesuai dengan kriteria filter.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-6">Pengirim Prospek</th>
                  <th className="py-3.5 px-4 w-40">Kontak</th>
                  <th className="py-3.5 px-4">Minat Unit / Subjek</th>
                  <th className="py-3.5 px-4 w-40">Sumber Form</th>
                  <th className="py-3.5 px-4 w-32">Status</th>
                  <th className="py-3.5 px-6 w-32">Waktu Masuk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {leads.map((lead) => {
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => handleOpenLeadDrawer(lead)}
                      className="hover:bg-slate-50/55 transition-colors cursor-pointer"
                    >
                      {/* Name Details */}
                      <td className="py-3 px-6">
                        <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                          <User2 size={14} className="text-slate-400" /> {lead.name}
                        </div>
                        {lead.city && <span className="text-[10px] text-slate-400 font-sans ml-5">{lead.city}</span>}
                      </td>

                      {/* Phone / WA */}
                      <td className="py-3 px-4 font-mono text-slate-700 space-y-0.5">
                        <div className="flex items-center gap-1"><Phone size={11} className="text-slate-400" /> +62 {lead.phone}</div>
                        {lead.email && <div className="flex items-center gap-1 text-[10px] text-slate-400 font-sans"><Mail size={10} /> {lead.email}</div>}
                      </td>

                      {/* Mobil / CarInterest */}
                      <td className="py-3 px-4">
                        {lead.car ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800 text-sm block">{lead.car.title}</span>
                            <span className="text-[10px] font-mono text-amber-600 font-bold block">{formatRupiah(lead.car.price)}</span>
                          </div>
                        ) : lead.carInterest ? (
                          <div className="space-y-0.5">
                            <span className="font-medium text-slate-800 line-clamp-1 block text-sm">{lead.carInterest}</span>
                            {lead.budget && (
                              <span className="text-[10px] text-slate-500 block">Anggaran: <span className="font-bold font-mono text-slate-700">{formatRupiah(lead.budget)}</span></span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Konsultasi Umum</span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3 px-4">
                        {getSourceBadge(lead.source)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {getStatusBadge(lead.status)}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-6 text-slate-400 text-[10px] font-mono leading-relaxed">
                        {formatDate(lead.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL SIDE PANEL DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fade-in bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-screen flex flex-col justify-between shadow-2xl border-l border-slate-100 relative">
            
            {/* Header drawer */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-display font-bold text-base">Detail Prospek</h3>
                <p className="text-[10px] text-slate-400 font-mono">ID: {selectedLead.id}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition active:scale-95"
              >
                Tutup Drawer
              </button>
            </div>

            {/* Scrollable details container */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Profile Card */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">{selectedLead.name[0]}</div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{selectedLead.name}</h4>
                    {selectedLead.city && <p className="text-xs text-slate-500">{selectedLead.city}</p>}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs text-slate-600 font-sans">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">No. WhatsApp:</span>
                    <a
                      href={`https://wa.me/62${selectedLead.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-semibold text-green-600 hover:underline flex items-center gap-0.5"
                    >
                      +62 {selectedLead.phone} <ExternalLink size={10} />
                    </a>
                  </div>
                  {selectedLead.email && (
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-400">E-mail:</span>
                      <span className="font-medium text-slate-800">{selectedLead.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">Tanggal Masuk:</span>
                    <span className="font-mono text-slate-800">{formatDate(selectedLead.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">Sumber Form:</span>
                    <span>{getSourceBadge(selectedLead.source)}</span>
                  </div>
                </div>
              </div>

              {/* Requirement Details */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-slate-900 border-b border-slate-100 pb-1.5">Kebutuhan / Unit Ketertarikan</h4>
                
                {selectedLead.car ? (
                  <div className="p-3 bg-amber-50 border border-amber-100 text-amber-950 rounded-xl space-y-1">
                    <span className="text-[10px] tracking-wider uppercase font-bold text-amber-600 block">Unit Tertarik:</span>
                    <a href={`#/cars/${selectedLead.car.slug}`} target="_blank" className="font-bold hover:underline text-sm leading-tight block">{selectedLead.car.title}</a>
                    <span className="font-mono font-bold text-xs block">{formatRupiah(selectedLead.car.price)}</span>
                  </div>
                ) : selectedLead.carInterest ? (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs">
                    <span className="text-[10px] tracking-wider uppercase font-bold text-slate-400 block">Kriteria Cari Mobil:</span>
                    <p className="font-medium text-slate-800 leading-relaxed font-sans">{selectedLead.carInterest}</p>
                    {selectedLead.budget && (
                      <p className="text-slate-500 font-sans mt-1">Anggaran Belanja: <span className="font-bold font-mono text-slate-700">{formatRupiah(selectedLead.budget)}</span></p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-xs italic">
                    Pengunjung mengirimkan formulir umum konsultasi tanpa ketertarikan spesifik.
                  </div>
                )}

                {/* Subject & User Message if present */}
                {(selectedLead.subject || selectedLead.message) && (
                  <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                    {selectedLead.subject && (
                      <p className="font-sans text-slate-500">Subjek Konsultasi: <span className="font-bold text-slate-800">{selectedLead.subject}</span></p>
                    )}
                    {selectedLead.message && (
                      <div className="space-y-1 mt-1 border-t border-slate-200/50 pt-2 font-sans">
                        <span className="font-semibold text-slate-500 block">Isi Pesan:</span>
                        <p className="italic text-slate-700 leading-relaxed font-sans bg-white p-2 rounded border border-slate-150">&ldquo;{selectedLead.message}&rdquo;</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ACTION: WORK LOGS / FOLLOW-UP STATUSES */}
              <div className="space-y-4 border-t border-slate-150 pt-5">
                <h4 className="font-display font-bold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle size={16} className="text-amber-500" /> Formulir Tindak Lanjut Admin
                </h4>

                {/* Select status dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Status Prospek Saat Ini</label>
                  <select
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value as LeadStatus)}
                    className="px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition text-xs font-semibold text-slate-700 bg-white"
                  >
                    <option value={LeadStatus.NEW}>🔵 NEW (Belum Dihubungi)</option>
                    <option value={LeadStatus.CONTACTED}>🟣 CONTACTED (Dihubungi)</option>
                    <option value={LeadStatus.NEGOTIATION}>🟡 NEGOTIATION (Tawar Menawar)</option>
                    <option value={LeadStatus.CLOSED}>🟢 CLOSED (Closing Deal/Terjual)</option>
                    <option value={LeadStatus.REJECTED}>⚫ REJECTED (Batal/Selesai)</option>
                  </select>
                </div>

                {/* Notes update */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Catatan Negosiasi / Follow-up *</label>
                  <textarea
                    rows={4}
                    placeholder="Tulis ringkasan hasil percakapan Anda, kesiapan dana survey, atau jadwal test drive..."
                    value={leadNotes}
                    onChange={(e) => setLeadNotes(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-xs font-sans outline-none focus:ring-1 focus:ring-amber-500 bg-white leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Save bar drawer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
              <button
                onClick={() => setSelectedLead(null)}
                className="flex-1 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs hover:bg-white transition"
              >
                Kembali
              </button>
              <button
                onClick={handleUpdateLead}
                disabled={isUpdating}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <Save size={14} /> {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
