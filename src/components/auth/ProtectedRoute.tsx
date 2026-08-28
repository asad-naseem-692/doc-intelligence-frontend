'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const isAuth = authStorage.isAuthenticated();
    if (!isAuth) {
      router.replace('/login');
      return;
    }

    if (requireAdmin && !authStorage.isAdmin()) {
      router.replace('/my-documents');
      return;
    }

    setIsAuthorized(true);
  }, [router, requireAdmin]);

  if (isAuthorized === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
