/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import WhatsappLeadPopup from './WhatsappLeadPopup';
import { LeadSource } from '../types';

export default function WhatsappFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-green-600 hover:bg-green-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 group flex items-center justify-center border border-green-500/10"
        title="Konsultasi WhatsApp dengan Kurator"
      >
        <span className="absolute right-14 bg-slate-900/80 text-white text-[11px] font-sans font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow border border-white/5">
          Konsultasi Suhu
        </span>
        {/* WhatsApp Icon mimicking SVG using standard lucide-react or message circle */}
        <MessageSquare className="w-6 h-6 animate-pulse" />
      </button>

      <WhatsappLeadPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        carId={null}
        source={LeadSource.WHATSAPP_FAB}
      />
    </>
  );
}
