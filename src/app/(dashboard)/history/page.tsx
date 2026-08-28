'use client';

import React from 'react';
import { History } from 'lucide-react';

export default function QAHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Q&A History</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your past grounded questions, answers, and source citations.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
          <History className="h-7 w-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Q&A History Log</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Historical Q&A records will be available in Slice 4.
        </p>
      </div>
    </div>
  );
}
