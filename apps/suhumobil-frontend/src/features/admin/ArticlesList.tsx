/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Sliders, Calendar, Clock } from 'lucide-react';
import { articlesService } from '../../services/articles.service';
import { Article, ArticleStatus } from '../../types';
import { formatDate } from '../../utils/format';

export default function ArticlesList() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchArticles();
  }, [search, statusFilter]);

  const fetchArticles = () => {
    setIsLoading(true);
    articlesService.getAdminArticles({
      status: statusFilter,
      search: search || undefined
    })
      .then(res => {
        if (res.success) {
          setArticles(res.data);
        }
      })
      .catch(err => console.error('Error fetching admin articles:', err))
      .finally(() => setIsLoading(false));
  };

  const handleDeleteArticle = async (id: string) => {
    if (confirm('⚠️ PERINGATAN HAPUS:\nApakah Anda yakin ingin menghapus artikel ini secara permanen?')) {
      try {
        const res = await articlesService.deleteArticle(id);
        if (res.success) {
          alert('Artikel berhasil dihapus!');
          fetchArticles();
        }
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus artikel.');
      }
    }
  };

  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case ArticleStatus.DRAFT:
        return <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">Draft</span>;
      case ArticleStatus.PUBLISHED:
        return <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md uppercase border border-green-200">Published</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header action row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Artikel & Edukasi Otomotif</h1>
          <p className="text-xs text-slate-500 mt-0.5">Tulis panduan perawatan, tips membeli mobil bekas, dan berita otomotif untuk SEO bursa Anda</p>
        </div>
        <Link
          to="/admin/articles/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow"
        >
          <Plus size={16} /> Tulis Artikel Baru
        </Link>
      </div>

      {/* FILTER SEARCH GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="sm:col-span-2 relative flex items-center">
          <input
            type="text"
            placeholder="Cari berdasarkan judul atau tag artikel..."
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
          </select>
        </div>
      </div>

      {/* ARTICLES TABLE */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 animate-pulse">
          <div className="h-6 w-full bg-slate-100 rounded" />
          <div className="h-20 w-full bg-slate-50 rounded" />
          <div className="h-20 w-full bg-slate-50 rounded" />
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-2 text-slate-400 text-sm">
          Belum ada artikel yang sesuai kriteria pencarian.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-6 w-16">Cover</th>
                  <th className="py-3.5 px-4">Judul Artikel</th>
                  <th className="py-3.5 px-4 w-40">Kategori / Tags</th>
                  <th className="py-3.5 px-4 w-28">Durasi Baca</th>
                  <th className="py-3.5 px-4 w-28">Status</th>
                  <th className="py-3.5 px-4 w-24">Tanggal Tulis</th>
                  <th className="py-3.5 px-6 w-32 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {articles.map((art) => {
                  return (
                    <tr key={art.id} className="hover:bg-slate-50/55 transition-colors">
                      {/* Photo Thumbnail */}
                      <td className="py-3 px-6">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border overflow-hidden flex items-center justify-center shrink-0">
                          {art.coverImage ? (
                            <img src={art.coverImage} alt="cover" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] text-slate-400 text-center uppercase font-bold tracking-wider">No Pic</span>
                          )}
                        </div>
                      </td>

                      {/* Name Details */}
                      <td className="py-3 px-4">
                        <Link to={`/articles/${art.slug}`} target="_blank" className="font-semibold text-slate-900 text-sm hover:text-amber-600 transition truncate block max-w-xs">
                          {art.title}
                        </Link>
                        <p className="text-[10px] text-slate-400 font-sans truncate max-w-xs mt-0.5">
                          {art.excerpt}
                        </p>
                      </td>

                      {/* Tags */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {art.tags?.map((t) => (
                            <span key={t} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-sans font-semibold capitalize">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Reading Time */}
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        <span className="flex items-center gap-1 font-sans"><Clock size={12} className="text-slate-400" /> {art.readingTimeMinutes} m</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {getStatusBadge(art.status)}
                      </td>

                      {/* Input date */}
                      <td className="py-3 px-4 text-slate-400 text-[10px] font-mono leading-relaxed">
                        <span className="flex items-center gap-1"><Calendar size={12} className="text-slate-300" /> {formatDate(art.createdAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-6 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => navigate(`/admin/articles/${art.id}/edit`)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                            title="Edit Artikel"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-600 transition"
                            title="Hapus Artikel"
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
    </div>
  );
}
