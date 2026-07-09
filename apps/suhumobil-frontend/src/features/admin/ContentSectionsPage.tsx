/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { LayoutTemplate, Save, Home, Info, PanelBottom, Phone } from 'lucide-react';
import { contentSectionsService } from '../../services/content-sections.service';

type PageKey = 'landing' | 'about' | 'footer' | 'contact';

const PAGES: { key: PageKey; label: string; icon: React.ReactNode }[] = [
  { key: 'landing', label: 'Landing Page', icon: <Home size={14} /> },
  { key: 'about', label: 'Tentang Kami', icon: <Info size={14} /> },
  { key: 'footer', label: 'Footer', icon: <PanelBottom size={14} /> },
  { key: 'contact', label: 'Kontak', icon: <Phone size={14} /> }
];

export default function ContentSectionsPage() {
  const [activePage, setActivePage] = useState<PageKey>('landing');
  const [sections, setSections] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    fetchSections(activePage);
  }, [activePage]);

  const fetchSections = (page: PageKey) => {
    setIsLoading(true);
    contentSectionsService.getAdminContent(page)
      .then(res => {
        if (res.success) setSections(res.data);
      })
      .catch(err => console.error('Error fetching content sections:', err))
      .finally(() => setIsLoading(false));
  };

  const handleFieldChange = (sectionKey: string, field: string, value: any) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [field]: value }
    }));
  };

  const handleSaveSection = async (sectionKey: string) => {
    setSavingKey(sectionKey);
    try {
      const res = await contentSectionsService.updateSection(activePage, sectionKey, sections[sectionKey]);
      if (res.success) {
        alert('Konten berhasil disimpan!');
      }
    } catch (err: any) {
      console.error('Error saving section:', err);
      alert(err.response?.data?.message || 'Gagal menyimpan konten.');
    } finally {
      setSavingKey(null);
    }
  };

  // Render a generic form based on the shape of the section's current data.
  // Simple string/number fields render as inputs; arrays of objects (like Trust
  // Section items) render as repeatable card groups.
  const renderSectionForm = (sectionKey: string, data: Record<string, any>) => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-display font-bold text-sm text-slate-900 capitalize">{sectionKey.replace(/_/g, ' ')}</h3>
          <button
            onClick={() => handleSaveSection(sectionKey)}
            disabled={savingKey === sectionKey}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow"
          >
            <Save size={13} />
            {savingKey === sectionKey ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>

        <div className="space-y-3">
          {Object.entries(data).map(([field, value]) => {
            if (Array.isArray(value)) {
              return (
                <div key={field} className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 capitalize">{field}</label>
                  {value.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                      {typeof item === 'object' && item !== null ? (
                        Object.entries(item).map(([subField, subValue]) => (
                          <div key={subField} className="flex flex-col gap-1">
                            <label className="text-[10px] font-semibold text-slate-500 capitalize">{subField}</label>
                            <input
                              type="text"
                              value={String(subValue ?? '')}
                              onChange={(e) => {
                                const updatedArray = [...value];
                                updatedArray[idx] = { ...updatedArray[idx], [subField]: e.target.value };
                                handleFieldChange(sectionKey, field, updatedArray);
                              }}
                              className="px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none text-xs focus:ring-1 focus:ring-amber-500 transition"
                            />
                          </div>
                        ))
                      ) : (
                        <input
                          type="text"
                          value={String(item ?? '')}
                          onChange={(e) => {
                            const updatedArray = [...value];
                            updatedArray[idx] = e.target.value;
                            handleFieldChange(sectionKey, field, updatedArray);
                          }}
                          className="px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none text-xs focus:ring-1 focus:ring-amber-500 transition w-full"
                        />
                      )}
                    </div>
                  ))}
                </div>
              );
            }

            const isLongText = typeof value === 'string' && (field === 'content' || field === 'narrative' || value.length > 120);
            return (
              <div key={field} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 capitalize">{field}</label>
                {isLongText ? (
                  <textarea
                    rows={4}
                    value={String(value ?? '')}
                    onChange={(e) => handleFieldChange(sectionKey, field, e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-xs focus:ring-1 focus:ring-amber-500 transition resize-none leading-relaxed"
                  />
                ) : (
                  <input
                    type="text"
                    value={String(value ?? '')}
                    onChange={(e) => handleFieldChange(sectionKey, field, e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-xs focus:ring-1 focus:ring-amber-500 transition"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
          <LayoutTemplate className="text-amber-500" size={24} />
          Konten Halaman
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Edit konten statis di setiap halaman publik tanpa perlu deploy ulang.</p>
      </div>

      {/* Page tabs */}
      <div className="flex border-b border-slate-200 bg-white px-2 rounded-xl border p-1 shadow-sm gap-1 max-w-2xl flex-wrap">
        {PAGES.map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePage(p.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 min-w-[110px] ${activePage === p.key ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {/* Sections form */}
      {isLoading ? (
        <div className="min-h-[30vh] flex flex-col justify-center items-center text-slate-500 font-sans gap-3 animate-pulse">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Memuat konten halaman...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(sections).map(([sectionKey, data]) => (
            <div key={sectionKey}>{renderSectionForm(sectionKey, data)}</div>
          ))}
        </div>
      )}
    </div>
  );
}
