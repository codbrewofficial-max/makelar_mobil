/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  MessageSquare,
  Facebook,
  Instagram,
  Send,
  Link as LinkIcon
} from 'lucide-react';
import { trackingService } from '../services/tracking.service';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: string;
  carSlug: string;
  carTitle: string;
}

const SOURCES = [
  { id: 'whatsapp', name: 'WhatsApp', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200', icon: <MessageSquare size={16} className="fill-emerald-700" /> },
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200', icon: <Instagram size={16} /> },
  { id: 'tiktok', name: 'TikTok', color: 'bg-slate-900 text-white hover:bg-slate-800 border-slate-750', icon: <span className="font-bold text-xs font-mono">TT</span> },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200', icon: <Facebook size={16} className="fill-blue-700" /> },
  { id: 'telegram', name: 'Telegram', color: 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200', icon: <Send size={16} className="fill-sky-700" /> },
  { id: 'custom', name: 'Kustom / Lainnya', color: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200', icon: <LinkIcon size={16} /> }
];

export default function ShareLinkModal({
  isOpen,
  onClose,
  carId,
  carSlug,
  carTitle
}: ShareLinkModalProps) {
  const [selectedSource, setSelectedSource] = useState('whatsapp');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  // Determine base public URL
  // e.g. http://localhost:3000/#/cars/toyota-avanza-2019-g-mt
  const baseOrigin = window.location.origin + window.location.pathname;
  const trackingUrl = `${baseOrigin}#/cars/${carSlug}?src=${selectedSource}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setIsCopied(true);
      
      // Call service to register click!
      await trackingService.registerClick(carId, selectedSource);

      setTimeout(() => {
        setIsCopied(false);
      }, 2500);
    } catch (err) {
      console.error('Error copying link to clipboard:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col font-sans animate-in fade-in-50 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-1.5 text-slate-900">
            <Share2 size={18} className="text-amber-500" />
            <h3 className="font-display font-bold text-sm tracking-tight">Bagikan & Salin Tautan Unit</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Unit Terpilih</span>
            <h4 className="font-semibold text-slate-900 text-sm truncate mt-0.5">{carTitle}</h4>
          </div>

          {/* Source grid */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">Pilih Media Sosial / Kanal Kampanye:</span>
            <div className="grid grid-cols-2 gap-2">
              {SOURCES.map((src) => {
                const isSelected = selectedSource === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => {
                      setSelectedSource(src.id);
                      setIsCopied(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition active:scale-95 ${src.color} ${
                      isSelected
                        ? 'ring-2 ring-amber-500 border-amber-500 font-bold'
                        : 'opacity-70 border-slate-200'
                    }`}
                  >
                    <span className="shrink-0">{src.icon}</span>
                    <span className="truncate">{src.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generated URL Box */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Tautan Pelacak yang Dihasilkan:</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                readOnly
                value={trackingUrl}
                className="w-full bg-transparent outline-none text-xs text-slate-600 font-mono select-all truncate border-none p-0"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition border border-slate-200"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow active:scale-95 ${
                isCopied
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              }`}
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
              {isCopied ? 'Tautan Berhasil Disalin!' : 'Salin Tautan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
