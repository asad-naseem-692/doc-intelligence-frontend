'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import { Users, ShieldCheck } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Admin User Management
                </h1>
                <p className="text-sm text-slate-500">
                  View and manage system users (Admin role only).
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">User List & Controls</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Full user administration, suspension, and deletion controls will be fully active in Slice 5.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
