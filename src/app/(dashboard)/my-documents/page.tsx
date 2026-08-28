'use client';

import React from 'react';
import { FileText, Plus, UploadCloud } from 'lucide-react';

export default function MyDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Documents</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload and manage your enterprise documents for AI semantic retrieval.
          </p>
        </div>
      </div>

      {/* Empty state / placeholder for Slice 2 */}
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
          <UploadCloud className="h-7 w-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No documents uploaded yet</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Document ingestion pipeline will be unlocked in Slice 2.
        </p>
      </div>
    </div>
  );
}
