/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';
import { articlesService } from '../../services/articles.service';
import { Article } from '../../types';
import { formatDate } from '../../utils/format';
import Watermark from '../../components/Watermark';

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const filters = {
      tag: selectedTag || undefined,
      search: search || undefined
    };

    articlesService.getArticles(filters)
      .then(res => {
        if (res.success) {
          setArticles(res.data);
          
          // Gather all unique tags for the filter bar
          if (!selectedTag && !search) {
            const allTags = new Set<string>();
            res.data.forEach(art => {
              if (art.tags) art.tags.forEach(t => allTags.add(t));
            });
            setTags(Array.from(allTags));
          }
        }
      })
      .catch(err => console.error('Error fetching articles:', err))
      .finally(() => setIsLoading(false));
  }, [selectedTag, search]);

  const handleTagClick = (tag: string) => {
    setSelectedTag(prev => prev === tag ? '' : tag);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans text-slate-800">
      {/* Header Intro */}
      <div className="mb-10 text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">Tips, Panduan & Berita Otomotif</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Ulasan dan artikel edukasi otomotif dari tim kurator SuhuMobil untuk membantu Anda merawat kendaraan dan pintar memilih mobil bekas.
        </p>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 pb-6 border-b border-slate-150">
        {/* Search */}
        <div className="relative flex items-center w-full md:w-80">
          <input
            type="text"
            placeholder="Cari artikel tips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition text-sm font-sans"
          />
          <Search size={14} className="absolute left-3 text-slate-400" />
        </div>

        {/* Tags list */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            <button
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${!selectedTag ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-white border border-slate-250 text-slate-600 hover:border-slate-400'}`}
            >
              Semua Artikel
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition capitalize ${selectedTag === tag ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-white border border-slate-250 text-slate-600 hover:border-slate-400'}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ARTICLES GRID */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl h-[360px] border border-slate-200 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <p className="text-slate-400 font-sans">Belum ada artikel tips yang sesuai dengan filter pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((art) => (
            <article
              key={art.id}
              onClick={() => window.location.href = `#/articles/${art.slug}`}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group cursor-pointer"
            >
              {/* Cover */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                {art.coverImage ? (
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-sans">
                    No Cover Image
                  </div>
                )}
                <Watermark variant="overlay" />
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {/* Meta */}
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-sans uppercase tracking-wider font-semibold">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(art.publishedAt || art.createdAt)}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {art.readingTimeMinutes} m baca</span>
                  </div>

                  <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-sans line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                {/* Footer tags & link */}
                <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                  <div className="flex gap-1.5 overflow-hidden">
                    {art.tags?.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium capitalize">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className="text-amber-600 hover:text-amber-700 font-semibold text-xs flex items-center gap-1 transition">
                    Baca Selengkapnya <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
