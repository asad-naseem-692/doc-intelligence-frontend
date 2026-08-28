'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { DocumentItem, QueryResponse } from '@/lib/types';
import MessageBubble, { ChatMessage } from '@/components/chat/MessageBubble';
import { Send, Sparkles, Filter, FileText, Loader2, RefreshCw } from 'lucide-react';

export default function AskPage() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get('document_id');
  const initialDocName = searchParams.get('filename');

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId || 'all');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch available ready documents for the scope filter dropdown
  useEffect(() => {
    async function loadDocs() {
      try {
        const docs = await apiClient<DocumentItem[]>('/documents');
        setDocuments(docs.filter((d) => d.status === 'ready'));
      } catch (err) {
        console.error('Failed to load documents for dropdown:', err);
      }
    }
    loadDocs();
  }, []);

  // Update selected doc if URL query changes
  useEffect(() => {
    if (initialDocId) {
      setSelectedDocId(initialDocId);
    }
  }, [initialDocId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion || isLoading) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: cleanQuestion,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setIsLoading(true);

    try {
      const payload: { question: string; document_id?: string } = {
        question: cleanQuestion,
      };
      if (selectedDocId !== 'all') {
        payload.document_id = selectedDocId;
      }

      const response = await apiClient<QueryResponse>('/query', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        citations: response.citations,
        isFallback: response.is_fallback,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: err.message || 'An error occurred while answering your question. Please try again.',
        isFallback: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDocObj = documents.find((d) => d.id === selectedDocId);

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto">
      {/* Header & Scope Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <span>Ask Your Documents</span>
            <Sparkles className="h-5 w-5 text-indigo-500" />
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Grounded enterprise question answering with source citations.
          </p>
        </div>

        {/* Document Scope Selector */}
        <div className="flex items-center space-x-2 bg-white rounded-xl border border-slate-200 px-3 py-1.5 shadow-sm text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium hidden sm:inline">Scope:</span>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer text-xs max-w-[200px] truncate"
          >
            <option value="all">All My Documents ({documents.length})</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.filename}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3 shadow-sm">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              {selectedDocObj ? `Ask about "${selectedDocObj.filename}"` : 'Ask anything about your documents'}
            </h2>
            <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
              Answers are generated strictly from the content of your uploaded documents with transparent citations.
            </p>

            {/* Starter Suggestion Pills */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              <button
                type="button"
                onClick={() => setQuestion('What are the main key points in this document?')}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 shadow-sm transition"
              >
                &ldquo;What are the main key points?&rdquo;
              </button>
              <button
                type="button"
                onClick={() => setQuestion('Summarize the executive summary.')}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 shadow-sm transition"
              >
                &ldquo;Summarize the executive summary&rdquo;
              </button>
              <button
                type="button"
                onClick={() => setQuestion('What are the key dates and deliverables?')}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 shadow-sm transition"
              >
                &ldquo;What are the key dates and deliverables?&rdquo;
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-3 text-slate-500 text-xs py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-600">Searching documents &amp; synthesizing answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (FEAT-10) */}
      <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-200">
        <div className="relative flex items-center rounded-2xl border border-slate-300 bg-white shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              selectedDocObj
                ? `Ask a question about ${selectedDocObj.filename}...`
                : 'Ask a question across all your uploaded documents...'
            }
            disabled={isLoading}
            className="w-full rounded-2xl bg-transparent py-3.5 pl-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            aria-label="Send question"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-2">
          Answers are strictly grounded in your documents. Fallback is returned if similarity falls below confidence threshold.
        </p>
      </form>
    </div>
  );
}
