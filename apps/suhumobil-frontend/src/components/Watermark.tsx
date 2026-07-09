/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { settingsService } from '../services/settings.service';
import { WatermarkSettings } from '../types';

interface WatermarkProps {
  variant?: 'footer' | 'overlay';
  className?: string;
  id?: string;
}

export default function Watermark({ variant = 'overlay', className = '', id }: WatermarkProps) {
  const [watermark, setWatermark] = useState<WatermarkSettings>({
    label: 'Terkurasi SuhuMobil',
    link: 'https://suhumobil.com'
  });

  useEffect(() => {
    let active = true;
    settingsService.getPublicSettings()
      .then(res => {
        if (active && res?.data?.watermark) {
          setWatermark(res.data.watermark);
        }
      })
      .catch(err => {
        console.error('Failed to load watermark setting:', err);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop navigation when clicking watermark on clickable elements
  };

  if (variant === 'footer') {
    return (
      <div id={id} className={`text-slate-400 text-xs font-sans hover:text-slate-600 transition-colors ${className}`}>
        <a
          href={watermark.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="underline"
        >
          {watermark.label}
        </a>
      </div>
    );
  }

  // Overlay variant (used inside image containers)
  return (
    <div
      id={id}
      className={`absolute bottom-2 right-2 z-10 select-none ${className}`}
    >
      <a
        href={watermark.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="px-2 py-0.5 text-[10px] font-mono tracking-wider text-white bg-slate-900/60 backdrop-blur-[2px] rounded-md border border-white/10 hover:bg-slate-950 transition-colors duration-150"
      >
        {watermark.label}
      </a>
    </div>
  );
}
