'use client';

import React, { useState } from 'react';
import { Citation } from '@/lib/types';
import { FileText, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface Props {
  citations: Citation[];
}

export default function CitationCard({ citations }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-slate-100">
      <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        <Layers className="h-3.5 w-3.5 text-indigo-500" />
        <span>Grounded Sources ({citations.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {citations.map((c, i) => {
          const isExpanded = expandedIndex === i;
          return (
            <div
              key={`${c.document_id}-${c.chunk_index}-${i}`}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs transition-all hover:bg-slate-50"
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
              >
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                  <span className="font-medium text-slate-800 truncate" title={c.filename}>
                    {c.filename}
                  </span>
                  <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-700">
                    Chunk #{c.chunk_index}
                  </span>
                </div>
                <button
                  type="button"
                  className="ml-1 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle citation excerpt"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-slate-600 leading-relaxed font-mono text-[11px] bg-white p-2 rounded-lg border">
                  &ldquo;{c.excerpt}&rdquo;
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
