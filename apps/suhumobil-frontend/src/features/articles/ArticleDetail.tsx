/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { articlesService } from '../../services/articles.service';
import { Article } from '../../types';
import { formatDate } from '../../utils/format';
import RichTextRenderer from '../../components/RichTextRenderer';
import Watermark from '../../components/Watermark';

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    articlesService.getArticleBySlug(slug)
      .then(res => {
        if (res.success) {
          setArticle(res.data);
        }
      })
      .catch(err => {
        console.error('Error fetching article:', err);
        setError('Artikel tips tidak ditemukan.');
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 animate-pulse space-y-8 font-sans">
        <div className="h-6 w-24 bg-slate-200 rounded" />
        <div className="space-y-3">
          <div className="h-10 w-full bg-slate-200 rounded" />
          <div className="h-10 w-2/3 bg-slate-200 rounded" />
        </div>
        <div className="h-[300px] w-full bg-slate-200 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-6 w-full bg-slate-200 rounded" />
          <div className="h-6 w-5/6 bg-slate-200 rounded" />
          <div className="h-6 w-4/5 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-xl mx-auto text-center py-24 px-6 font-sans">
        <div className="text-amber-500 text-5xl mb-4 font-display font-bold">404</div>
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Artikel Tidak Ditemukan</h2>
        <p className="text-slate-500 text-sm mb-6">{error || 'Halaman artikel yang Anda cari tidak tersedia.'}</p>
        <Link
          to="/articles"
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition shadow"
        >
          Kembali ke Artikel
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-10 font-sans text-slate-800">
      {/* Back Link */}
      <div className="mb-6">
        <Link to="/articles" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm font-medium transition">
          <ArrowLeft size={16} /> Kembali ke Artikel
        </Link>
      </div>

      {/* Header Block */}
      <header className="space-y-4 mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-900 leading-tight tracking-tight">
          {article.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 border-b border-slate-100 pb-4">
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar size={14} className="text-slate-400" />
            {formatDate(article.publishedAt || article.createdAt)}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Clock size={14} className="text-slate-400" />
            Waktu baca: {article.readingTimeMinutes} menit
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full font-sans uppercase text-[10px] tracking-wider">
            Suhu Verifikasi
          </span>
        </div>
      </header>

      {/* Hero Image Container */}
      {article.coverImage && (
        <div className="bg-slate-150 rounded-2xl overflow-hidden shadow-sm relative aspect-[21/9] mb-8 border border-slate-200">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <Watermark variant="overlay" />
        </div>
      )}

      {/* Article Body Content */}
      <main className="mb-10">
        <RichTextRenderer content={article.content} />
      </main>

      {/* Tag badges row */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-6">
          <span className="text-slate-400 text-xs flex items-center gap-1 font-sans mr-1">
            <Tag size={12} /> Tags:
          </span>
          {article.tags.map((tag) => (
            <Link
              key={tag}
              to={`/articles?tag=${tag}`}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-sans font-medium px-3 py-1 rounded-full capitalize transition-colors duration-150"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
