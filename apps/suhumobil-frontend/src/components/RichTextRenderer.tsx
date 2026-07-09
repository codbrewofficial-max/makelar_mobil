/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface RichTextRendererProps {
  content: string;
  className?: string;
  id?: string;
}

export default function RichTextRenderer({ content, className = '', id }: RichTextRendererProps) {
  if (!content) return null;

  return (
    <div
      id={id}
      className={`prose max-w-none text-slate-700 font-sans leading-relaxed 
        [&>p]:mb-4 [&>p:last-child]:mb-0
        [&>h1]:text-3xl [&>h1]:font-display [&>h1]:font-bold [&>h1]:text-slate-900 [&>h1]:mt-6 [&>h1]:mb-4
        [&>h2]:text-2xl [&>h2]:font-display [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-6 [&>h2]:mb-3
        [&>h3]:text-xl [&>h3]:font-display [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-5 [&>h3]:mb-2
        [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul>li]:mb-1
        [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>ol>li]:mb-1
        [&>blockquote]:border-l-4 [&>blockquote]:border-amber-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-600 [&>blockquote]:my-4
        [&>a]:text-amber-600 [&>a]:underline [&>a]:font-medium hover:[&>a]:text-amber-700
        [&>img]:rounded-xl [&>img]:my-6 [&>img]:shadow-md
        [&>pre]:bg-slate-100 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:font-mono [&>pre]:text-sm
        [&>code]:bg-slate-100 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono [&>code]:text-sm
        ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
