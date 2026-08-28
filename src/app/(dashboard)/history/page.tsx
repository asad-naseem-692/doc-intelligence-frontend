'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { QAHistoryEntry } from '@/lib/types';
import CitationCard from '@/components/chat/CitationCard';
import {
  History,
  Search,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MessageSquare,
  Filter,
} from 'lucide-react';
import clsx from 'clsx';

export default function QAHistoryPage() {
  const [history, setHistory] = useState<QAHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'grounded' | 'fallback'>('all');
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient<QAHistoryEntry[]>('/query/history');
      setHistory(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load Q&A history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const toggleExpand = (id: string) => {
    setExpandedEntries((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'grounded') return !item.is_fallback;
    if (filterType === 'fallback') return item.is_fallback;
    return true;
  });

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <span>Q&A History</span>
            <History className="h-6 w-6 text-indigo-500" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review past grounded answers, citations, and fallback queries.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchHistory}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
            title="Refresh history"
          >
            <RefreshCw className={clsx('h-3.5 w-3.5', { 'animate-spin': loading })} />
            <span>Refresh</span>
          </button>
          <Link
            href="/ask"
            className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>New Question</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past questions or answers..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm transition"
          />
        </div>

        <div className="flex items-center space-x-2 bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Filter:</span>
          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer text-xs"
          >
            <option value="all">All Queries ({history.length})</option>
            <option value="grounded">
              Grounded Answers ({history.filter((h) => !h.is_fallback).length})
            </option>
            <option value="fallback">
              Fallback Responses ({history.filter((h) => h.is_fallback).length})
            </option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <RefreshCw className="h-7 w-7 animate-spin text-indigo-500 mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading your Q&A history...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
            <History className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {searchQuery || filterType !== 'all'
              ? 'No matching Q&A records found'
              : 'No Q&A history yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            {searchQuery || filterType !== 'all'
              ? 'Try changing your search terms or filters.'
              : 'Questions you ask in the Ask AI tab will be saved and listed here with full citations.'}
          </p>
          <Link
            href="/ask"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition"
          >
            Ask your first question
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((entry) => {
            const isExpanded = expandedEntries[entry.id] ?? false;
            return (
              <div
                key={entry.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Question Row */}
                <div
                  className="p-5 cursor-pointer flex items-start justify-between gap-4 select-none"
                  onClick={() => toggleExpand(entry.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2.5 mb-2">
                      <span
                        className={clsx(
                          'inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                          {
                            'bg-emerald-100 text-emerald-700': !entry.is_fallback,
                            'bg-amber-100 text-amber-800': entry.is_fallback,
                          }
                        )}
                      >
                        {!entry.is_fallback ? (
                          <>
                            <Sparkles className="h-3 w-3" />
                            <span>Grounded Answer</span>
                          </>
                        ) : (
                          <>
                            <Info className="h-3 w-3" />
                            <span>Fallback (Not Found)</span>
                          </>
                        )}
                      </span>

                      <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(entry.created_at)}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 leading-snug">
                      {entry.question}
                    </h3>
                  </div>

                  <button
                    type="button"
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition mt-0.5"
                    aria-label="Toggle details"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Expanded Answer & Citations */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50">
                    <div className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap rounded-xl bg-white p-4 border border-slate-200">
                      {entry.answer}
                    </div>

                    {!entry.is_fallback && entry.citations && entry.citations.length > 0 && (
                      <div className="mt-4">
                        <CitationCard citations={entry.citations} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
