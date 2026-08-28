'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, File, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { DocumentItem } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  onUploadSuccess: (doc: DocumentItem) => void;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export default function DocumentUploader({ onUploadSuccess }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      return 'Only .pdf and .docx files are supported';
    }
    if (file.size > 50 * 1024 * 1024) {
      return 'File exceeds maximum size of 50 MB';
    }
    if (file.size === 0) {
      return 'File appears to be empty';
    }
    return null;
  };

  const handleFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setUploadState('error');
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setUploadState('uploading');
    setProgress(30);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setProgress(60);
      const doc = await apiClient<DocumentItem>('/documents', {
        method: 'POST',
        body: formData,
      });
      setProgress(100);
      setUploadState('success');
      onUploadSuccess(doc);

      // Reset after short delay
      setTimeout(() => {
        setUploadState('idle');
        setSelectedFile(null);
        setProgress(0);
      }, 2000);
    } catch (err: any) {
      setUploadState('error');
      setErrorMessage(err.message || 'Upload failed. Please try again.');
      setProgress(0);
    }
  }, [onUploadSuccess]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => uploadState === 'idle' && inputRef.current?.click()}
        className={clsx(
          'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200',
          {
            'border-indigo-400 bg-indigo-50 scale-[1.01]': dragActive,
            'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer': uploadState === 'idle',
            'border-indigo-300 bg-indigo-50': uploadState === 'uploading',
            'border-emerald-300 bg-emerald-50': uploadState === 'success',
            'border-red-300 bg-red-50': uploadState === 'error',
          }
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={handleInputChange}
        />

        {uploadState === 'idle' && (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-4">
              <UploadCloud className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Drag &amp; drop your document here
            </p>
            <p className="mt-1 text-xs text-slate-500">
              or <span className="text-indigo-600 font-semibold">browse</span> to upload &nbsp;&middot;&nbsp; PDF or DOCX &nbsp;&middot;&nbsp; Max 50 MB
            </p>
          </>
        )}

        {uploadState === 'uploading' && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm font-semibold text-indigo-700">
              Uploading {selectedFile?.name}...
            </p>
            <div className="mt-3 w-full max-w-xs rounded-full bg-indigo-100 h-1.5">
              <div
                className="h-1.5 rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}

        {uploadState === 'success' && (
          <>
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3" />
            <p className="text-sm font-semibold text-emerald-700">
              {selectedFile?.name} uploaded successfully!
            </p>
            <p className="mt-1 text-xs text-emerald-600">Processing has started...</p>
          </>
        )}

        {uploadState === 'error' && (
          <>
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <p className="text-sm font-semibold text-red-700">Upload failed</p>
            <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setUploadState('idle'); setErrorMessage(null); }}
              className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
