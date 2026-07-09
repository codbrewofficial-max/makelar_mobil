/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon, HelpCircle } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  id?: string;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, id, placeholder = 'Tulis deskripsi lengkap di sini...' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Initialize value once, or update if external value differs significantly
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleAddLink = () => {
    const url = prompt('Masukkan URL Link (contoh: https://example.com):', 'https://');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  return (
    <div id={id} className={`w-full rounded-xl border overflow-hidden flex flex-col bg-white transition-all duration-200 ${isFocused ? 'ring-2 ring-amber-500 border-amber-500 shadow-md' : 'border-slate-200'}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-100 select-none">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          title="Tebal (Ctrl+B)"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          title="Miring (Ctrl+I)"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition"
        >
          <Italic size={16} />
        </button>
        <div className="w-[1px] h-4 bg-slate-300 mx-1" />
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          title="Judul H2"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h3>')}
          title="Judul H3"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition"
        >
          <Heading3 size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<p>')}
          title="Teks Normal"
          className="px-2 py-1 text-xs font-semibold rounded-lg hover:bg-slate-200 text-slate-700 transition"
        >
          P
        </button>
        <div className="w-[1px] h-4 bg-slate-300 mx-1" />
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          title="Daftar Bullet"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          title="Daftar Angka"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition"
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<blockquote>')}
          title="Kutipan"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition"
        >
          <Quote size={16} />
        </button>
        <div className="w-[1px] h-4 bg-slate-300 mx-1" />
        <button
          type="button"
          onClick={handleAddLink}
          title="Sematkan Link"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition"
        >
          <LinkIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('unlink')}
          title="Hapus Link"
          className="px-2 py-1 text-xs font-semibold rounded-lg hover:bg-slate-200 text-red-600 transition"
        >
          Unlink
        </button>
      </div>

      {/* Editor Body */}
      <div className="relative min-h-[250px] flex flex-col">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            handleInput();
          }}
          className="outline-none p-4 min-h-[250px] w-full prose max-w-none text-slate-700 font-sans leading-relaxed overflow-y-auto
            [&>p]:mb-4 [&>p:last-child]:mb-0
            [&>h1]:text-3xl [&>h1]:font-display [&>h1]:font-bold [&>h1]:text-slate-900 [&>h1]:mt-6 [&>h1]:mb-4
            [&>h2]:text-2xl [&>h2]:font-display [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-6 [&>h2]:mb-3
            [&>h3]:text-xl [&>h3]:font-display [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-5 [&>h3]:mb-2
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul>li]:mb-1
            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>ol>li]:mb-1
            [&>blockquote]:border-l-4 [&>blockquote]:border-amber-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-600 [&>blockquote]:my-4
            [&>a]:text-amber-600 [&>a]:underline hover:[&>a]:text-amber-700"
          style={{ wordBreak: 'break-word' }}
        />
        {!value && (
          <div className="absolute top-4 left-4 text-slate-400 pointer-events-none select-none font-sans">
            {placeholder}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center bg-slate-50 px-4 py-1.5 border-t border-slate-100 text-[10px] text-slate-400 font-sans">
        <span className="flex items-center gap-1">
          <HelpCircle size={10} /> Format teks secara visual menggunakan menu di atas
        </span>
        <span>HTML Mode</span>
      </div>
    </div>
  );
}
