'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';
import { User } from '@/lib/types';
import { apiClient } from '@/lib/api';
import { 
  FileText, 
  MessageSquare, 
  History, 
  Users, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(authStorage.getUser());
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // ignore network failure on logout
    } finally {
      authStorage.clear();
      router.push('/login');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo / Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-100">
            <Sparkles className="h-5 w-5" />
          </div>
          <Link href={isAdmin ? '/admin/users' : '/my-documents'} className="text-lg font-bold tracking-tight text-slate-900">
            Doc<span className="text-indigo-600">Intel</span>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {!isAdmin ? (
            <>
              <Link
                href="/my-documents"
                className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === '/my-documents'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Documents</span>
              </Link>
              <Link
                href="/ask"
                className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === '/ask'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Ask AI</span>
              </Link>
              <Link
                href="/history"
                className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === '/history'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <History className="h-4 w-4" />
                <span>Q&A History</span>
              </Link>
            </>
          ) : (
            <Link
              href="/admin/users"
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith('/admin')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </Link>
          )}
        </nav>

        {/* User Badge & Sign Out Button */}
        <div className="flex items-center space-x-3">
          {user && (
            <div className="hidden md:flex items-center space-x-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
              {isAdmin ? (
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              ) : (
                <UserIcon className="h-3.5 w-3.5 text-slate-500" />
              )}
              <span className="font-medium">{user.name}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
              }`}>
                {user.role}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-red-600 active:scale-95"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
