'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Trash2, MessageSquare, Calendar, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { DocumentItem } from '@/lib/types';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const POLL_INTERVAL_MS = 4000;

interface Props {
  initialDocuments: DocumentItem[];
  onDocumentDeleted?: (docId: string) => void;
}

export default function DocumentList({ initialDocuments, onDocumentDeleted }: Props) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync if parent passes new initialDocuments (e.g. after upload)
  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  // Poll status for "processing" documents
  const pollProcessingDocs = useCallback(async () => {
    const processingDocs = documents.filter((d) => d.status === 'processing');
    if (processingDocs.length === 0) return;

    const updates = await Promise.allSettled(
      processingDocs.map((doc) =>
        apiClient<DocumentItem>(`/documents/${doc.id}`)
      )
    );

    setDocuments((prev) => {
      const updated = [...prev];
      updates.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          const freshDoc = result.value;
          const i = updated.findIndex((d) => d.id === freshDoc.id);
          if (i !== -1) updated[i] = freshDoc;
        }
      });
      return updated;
    });
  }, [documents]);

  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === 'processing');
    if (!hasProcessing) return;

    const interval = setInterval(pollProcessingDocs, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [documents, pollProcessingDocs]);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await apiClient(`/documents/${confirmDeleteId}`, { method: 'DELETE' });
      setDocuments((prev) => prev.filter((d) => d.id !== confirmDeleteId));
      onDocumentDeleted?.(confirmDeleteId);
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleAskQuestion = (doc: DocumentItem) => {
    router.push(`/ask?document_id=${doc.id}&filename=${encodeURIComponent(doc.filename)}`);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
        <FileText className="h-10 w-10 text-slate-300 mb-3" />
        <p className="text-sm font-medium text-slate-600">No documents uploaded yet</p>
        <p className="text-xs text-slate-400 mt-1">Upload a PDF or DOCX above to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Document
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell">
                Uploaded
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-800 truncate max-w-[200px]" title={doc.filename}>
                      {doc.filename}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={doc.status} />
                    {doc.status === 'processing' && (
                      <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(doc.uploaded_at)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleAskQuestion(doc)}
                      disabled={doc.status !== 'ready'}
                      title={doc.status !== 'ready' ? 'Document must be ready to query' : 'Ask a question'}
                      className="flex items-center space-x-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Ask</span>
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(doc.id)}
                      title="Delete document"
                      className="flex items-center space-x-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete Document?"
          message="This will remove the document and everything learned from it — all chunks, embeddings, and related Q&A history will be permanently deleted. Continue?"
          confirmLabel="Delete"
          isDestructive
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </>
  );
}
