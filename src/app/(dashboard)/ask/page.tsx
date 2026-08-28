'use client';

import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function AskQuestionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ask AI</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ask questions grounded directly in your uploaded enterprise documents.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
          <Sparkles className="h-7 w-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Grounded Q&A Interface</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Hybrid retrieval, confidence checks, and citation tracking will be implemented in Slice 3.
        </p>
      </div>
    </div>
  );
}
