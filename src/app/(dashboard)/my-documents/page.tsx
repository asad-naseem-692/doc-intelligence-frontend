'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { DocumentItem } from '@/lib/types';
import DocumentUploader from '@/components/documents/DocumentUploader';
import DocumentList from '@/components/documents/DocumentList';
import { FileText, RefreshCw } from 'lucide-react';

export default function MyDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await apiClient<DocumentItem[]>('/documents');
      setDocuments(docs);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUploadSuccess = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Documents</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload and manage your enterprise documents for AI semantic retrieval.
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchDocuments(); }}
          className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition self-start sm:self-auto"
          title="Refresh document list"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Upload Zone (FEAT-06) */}
      <DocumentUploader onUploadSuccess={handleUploadSuccess} />

      {/* Documents Table (FEAT-07 + FEAT-08 + FEAT-09) */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-700">
            Your Documents
            {documents.length > 0 && (
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {documents.length}
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-12">
            <div className="flex flex-col items-center space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
              <p className="text-sm text-slate-500">Loading documents...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              onClick={fetchDocuments}
              className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <DocumentList
            initialDocuments={documents}
            onDocumentDeleted={(id) =>
              setDocuments((prev) => prev.filter((d) => d.id !== id))
            }
          />
        )}
      </div>
    </div>
  );
}
