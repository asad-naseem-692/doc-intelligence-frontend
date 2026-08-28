'use client';

import React from 'react';
import { DocumentStatusType } from '@/lib/types';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  status: DocumentStatusType;
}

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        {
          'bg-amber-100 text-amber-700': status === 'processing',
          'bg-emerald-100 text-emerald-700': status === 'ready',
          'bg-red-100 text-red-700': status === 'failed',
        }
      )}
    >
      {status === 'processing' && (
        <Loader2 className="h-3 w-3 animate-spin" />
      )}
      {status === 'ready' && (
        <CheckCircle2 className="h-3 w-3" />
      )}
      {status === 'failed' && (
        <XCircle className="h-3 w-3" />
      )}
      <span className="capitalize">{status}</span>
    </span>
  );
}
