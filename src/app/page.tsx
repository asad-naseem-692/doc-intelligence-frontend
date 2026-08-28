'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (authStorage.isAuthenticated()) {
      if (authStorage.isAdmin()) {
        router.replace('/admin/users');
      } else {
        router.replace('/my-documents');
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center space-x-2 text-slate-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <span>Loading...</span>
      </div>
    </div>
  );
}
