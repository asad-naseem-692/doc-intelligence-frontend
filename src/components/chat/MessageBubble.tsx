'use client';

import React from 'react';
import { Citation } from '@/lib/types';
import CitationCard from './CitationCard';
import { Bot, User, Info } from 'lucide-react';
import clsx from 'clsx';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  citations?: Citation[];
  isFallback?: boolean;
  timestamp: string;
}

interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.sender === 'user';
  const isFallback = message.isFallback;

  return (
    <div
      className={clsx('flex w-full space-x-3', {
        'justify-end': isUser,
        'justify-start': !isUser,
      })}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <Bot className="h-5 w-5" />
        </div>
      )}

      <div
        className={clsx('max-w-2xl rounded-2xl px-5 py-4 shadow-sm text-sm', {
          'bg-indigo-600 text-white rounded-tr-none': isUser,
          'bg-amber-50/80 border border-amber-200/80 text-amber-900 rounded-tl-none': !isUser && isFallback,
          'bg-white border border-slate-200 text-slate-800 rounded-tl-none': !isUser && !isFallback,
        })}
      >
        {/* If fallback, show distinct neutral/info style banner */}
        {!isUser && isFallback && (
          <div className="flex items-center space-x-2 text-amber-800 font-semibold text-xs mb-2 pb-1.5 border-b border-amber-200/60">
            <Info className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Information Not Found</span>
          </div>
        )}

        {/* Message body */}
        <div className="leading-relaxed whitespace-pre-wrap">
          {message.text}
        </div>

        {/* Citations section if available and not fallback */}
        {!isUser && !isFallback && message.citations && message.citations.length > 0 && (
          <CitationCard citations={message.citations} />
        )}

        {/* Timestamp */}
        <div
          className={clsx('mt-2 text-[10px]', {
            'text-indigo-200 text-right': isUser,
            'text-slate-400': !isUser,
          })}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white shadow-sm">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
