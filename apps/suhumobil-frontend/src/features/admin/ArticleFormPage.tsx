/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Sparkles, BookOpen, Clock, Tag, Image as ImageIcon } from 'lucide-react';
import { articlesService } from '../../services/articles.service';
import { Article, ArticleStatus } from '../../types';
import RichTextEditor from '../../components/RichTextEditor';

const articleSchema = z.object({
  title: z.string().min(5, 'Judul artikel minimal 5 karakter'),
  excerpt: z.string().min(10, 'Kutipan/Ringkasan minimal 10 karakter'),
  coverImage: z.string().url('Format URL foto sampul tidak valid').or(z.string().length(0)),
  readingTimeMinutes: z.coerce.number().min(1, 'Durasi membaca minimal 1 menit'),
  status: z.nativeEnum(ArticleStatus),
  tagsInput: z.string().optional()
});

type ArticleFormValues = z.infer<typeof articleSchema>;

export default function ArticleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Content Rich Text Editor state
  const [content, setContent] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema) as any,
    defaultValues: {
      title: '',
      excerpt: '',
      coverImage: '',
      readingTimeMinutes: 5,
      status: ArticleStatus.DRAFT,
      tagsInput: ''
    }
  });

  useEffect(() => {
    if (isEdit) {
      setIsLoading(true);
      articlesService.getAdminArticleById(id)
        .then(res => {
          if (res.success && res.data) {
            setArticle(res.data);
            setContent(res.data.content || '');
            
            // Map values to hook form
            setValue('title', res.data.title);
            setValue('excerpt', res.data.excerpt);
            setValue('coverImage', res.data.coverImage || '');
            setValue('readingTimeMinutes', res.data.readingTimeMinutes);
            setValue('status', res.data.status);
            setValue('tagsInput', res.data.tags ? res.data.tags.join(', ') : '');
          }
        })
        .catch(err => {
          console.error(err);
          alert('Gagal mengambil data artikel.');
          navigate('/admin/articles');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEdit, setValue, navigate]);

  const handleSaveArticle = async (values: ArticleFormValues) => {
    if (!content.trim()) {
      alert('Isi artikel tidak boleh kosong!');
      return;
    }

    setIsSaving(true);
    try {
      // Process comma-separated tags input
      const tags = values.tagsInput
        ? values.tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
        : [];

      const payload = {
        title: values.title,
        excerpt: values.excerpt,
        content,
        coverImage: values.coverImage || undefined,
        readingTimeMinutes: Number(values.readingTimeMinutes),
        status: values.status,
        tags
      };

      if (isEdit && article) {
        const res = await articlesService.updateArticle(article.id, payload);
        if (res.success) {
          alert('Artikel berhasil diperbarui!');
          navigate('/admin/articles');
        }
      } else {
        const res = await articlesService.createArticle(payload);
        if (res.success) {
          alert('Artikel berhasil diterbitkan!');
          navigate('/admin/articles');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan artikel.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper file upload converting to base64 for fallback
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setValue('coverImage', base64);
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-slate-500 font-sans gap-3 animate-pulse">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span>Memuat konten artikel...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 max-w-5xl">
      {/* Header Back Row */}
      <div className="flex items-center gap-4">
        <Link to="/admin/articles" className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">
            {isEdit ? 'Ubah Informasi Artikel' : 'Tulis Artikel Edukasi Baru'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Tulis panduan bermanfaat untuk pengunjung bursa, tambahkan tag kata kunci dan foto sampul</p>
        </div>
      </div>

      {/* Main Form container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit(handleSaveArticle)} className="space-y-6">
          <h3 className="font-display font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" /> Draft Jurnalistik & Metadata
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Title */}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Judul Jurnal / Artikel *</label>
              <input
                type="text"
                placeholder="Contoh: 5 Hal Wajib Diperiksa Saat Melakukan Test Drive Mobil Bekas"
                {...register('title')}
                className={`px-3 py-2 border rounded-xl outline-none text-sm transition ${errors.title ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
              />
              {errors.title && <span className="text-[10px] text-red-500">{errors.title.message}</span>}
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Status Publikasi *</label>
              <select
                {...register('status')}
                className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:ring-1 focus:ring-amber-500 transition bg-white font-sans font-semibold text-slate-700"
              >
                <option value={ArticleStatus.DRAFT}>DRAFT (Simpan Saja)</option>
                <option value={ArticleStatus.PUBLISHED}>PUBLISHED (Terbitkan)</option>
              </select>
            </div>

            {/* Excerpt */}
            <div className="md:col-span-3 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Kutipan Singkat / Ringkasan Deskripsi *</label>
              <textarea
                rows={2}
                placeholder="Tulis 1-2 kalimat pengantar menarik yang merangkum keseluruhan isi tulisan untuk memicu minat klik pembaca di halaman katalog..."
                {...register('excerpt')}
                className={`px-3 py-2 border rounded-xl outline-none text-sm transition ${errors.excerpt ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
              />
              {errors.excerpt && <span className="text-[10px] text-red-500">{errors.excerpt.message}</span>}
            </div>

            {/* Tags (Comma Separated) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1"><Tag size={12} /> Tags Kategori</label>
              <input
                type="text"
                placeholder="tips, mobil bekas, transmisi matic"
                {...register('tagsInput')}
                className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:ring-1 focus:ring-amber-500 transition"
              />
              <span className="text-[10px] text-slate-400">Pisahkan beberapa tag dengan tanda koma ( , )</span>
            </div>

            {/* Reading Time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1"><Clock size={12} /> Estimasi Waktu Baca (Menit)</label>
              <input
                type="number"
                placeholder="5"
                {...register('readingTimeMinutes')}
                className={`px-3 py-2 border rounded-xl outline-none text-sm transition ${errors.readingTimeMinutes ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
              />
              {errors.readingTimeMinutes && <span className="text-[10px] text-red-500">{errors.readingTimeMinutes.message}</span>}
            </div>

            {/* Cover Image URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1"><ImageIcon size={12} /> Foto Sampul (URL)</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/photo-..."
                {...register('coverImage')}
                className={`px-3 py-2 border rounded-xl outline-none text-sm transition ${errors.coverImage ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
              />
              {errors.coverImage && <span className="text-[10px] text-red-500">{errors.coverImage.message}</span>}
            </div>
          </div>

          {/* Quick upload file as cover */}
          <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between text-xs text-slate-600 gap-4">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800">Upload Alternatif File Gambar</span>
              <p className="text-[10px] text-slate-400">Pilih file gambar lokal Anda untuk dikonversi menjadi data tersemat instan.</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
            />
          </div>

          {/* Rich Text Editor for Content */}
          <div className="flex flex-col gap-2 pt-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1"><BookOpen size={14} /> Badan Artikel / Tulisan Lengkap *</label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          {/* Bottom Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <Link
              to="/admin/articles"
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Save size={14} /> {isSaving ? 'Menyimpan...' : 'Simpan Draft Artikel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
