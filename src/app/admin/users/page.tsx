'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { apiClient } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { User } from '@/lib/types';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  UserX,
  UserCheck,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import clsx from 'clsx';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Confirmation modals state
  const [confirmSuspendUser, setConfirmSuspendUser] = useState<User | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const currentUser = authStorage.getUser();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient<User[]>('/admin/users');
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load user directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleSuspend = async () => {
    if (!confirmSuspendUser) return;
    try {
      setActionLoading(true);
      const updated = await apiClient<User>(`/admin/users/${confirmSuspendUser.id}/suspend`, {
        method: 'PATCH',
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, is_active: updated.is_active } : u))
      );
      setConfirmSuspendUser(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update user suspension status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDeleteUser) return;
    try {
      setActionLoading(true);
      await apiClient(`/admin/users/${confirmDeleteUser.id}`, {
        method: 'DELETE',
      });
      setUsers((prev) => prev.filter((u) => u.id !== confirmDeleteUser.id));
      setConfirmDeleteUser(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (roleFilter !== 'all' && u.role !== roleFilter) return false;

    const isActive = u.is_active ?? true;
    if (statusFilter === 'active' && !isActive) return false;
    if (statusFilter === 'suspended' && isActive) return false;

    return true;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active ?? true).length;
  const suspendedUsers = users.filter((u) => u.is_active === false).length;
  const adminUsers = users.filter((u) => u.role === 'admin').length;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  User Management &amp; Access Control
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Admin panel to view all registered accounts, suspend access, or cascade-delete data.
                </p>
              </div>
            </div>

            <button
              onClick={fetchUsers}
              className="flex items-center space-x-2 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              <RefreshCw className={clsx('h-3.5 w-3.5', { 'animate-spin': loading })} />
              <span>Refresh Users</span>
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Users className="h-4 w-4 text-indigo-500" />
                <span>Total Users</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{totalUsers}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                <UserCheck className="h-4 w-4 text-emerald-500" />
                <span>Active Accounts</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{activeUsers}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-600 uppercase tracking-wider">
                <UserX className="h-4 w-4 text-amber-500" />
                <span>Suspended</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{suspendedUsers}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                <span>Administrators</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{adminUsers}</p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm transition"
              />
            </div>

            <div className="flex items-center space-x-2 bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Role:</span>
              <select
                value={roleFilter}
                onChange={(e: any) => setRoleFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">All Roles</option>
                <option value="user">Standard User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>
          </div>

          {/* User Table (FEAT-15 & FEAT-16) */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-16">
                <RefreshCw className="h-7 w-7 animate-spin text-indigo-500 mb-3" />
                <p className="text-sm font-medium text-slate-600">Loading user directory...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-red-50 text-red-700 text-sm font-semibold">
                {error}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-16 text-center text-slate-500 text-sm">
                No users found matching your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-3.5">User</th>
                      <th className="px-6 py-3.5">Role</th>
                      <th className="px-6 py-3.5">Account Status</th>
                      <th className="px-6 py-3.5 hidden md:table-cell">Joined</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => {
                      const isActive = user.is_active ?? true;
                      const isSelf = currentUser?.id === user.id;

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Name & Email */}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700 uppercase text-xs">
                                {user.name.slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                                  <span>{user.name}</span>
                                  {isSelf && (
                                    <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[10px] font-bold text-indigo-700">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 truncate flex items-center space-x-1 mt-0.5">
                                  <Mail className="h-3 w-3" />
                                  <span>{user.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="px-6 py-4">
                            <span
                              className={clsx(
                                'inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                {
                                  'bg-indigo-100 text-indigo-700': user.role === 'admin',
                                  'bg-slate-100 text-slate-700': user.role !== 'admin',
                                }
                              )}
                            >
                              {user.role === 'admin' ? (
                                <ShieldCheck className="h-3 w-3" />
                              ) : (
                                <UserIcon className="h-3 w-3" />
                              )}
                              <span className="capitalize">{user.role}</span>
                            </span>
                          </td>

                          {/* Account Status Badge */}
                          <td className="px-6 py-4">
                            <span
                              className={clsx(
                                'inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                {
                                  'bg-emerald-100 text-emerald-700': isActive,
                                  'bg-amber-100 text-amber-800': !isActive,
                                }
                              )}
                            >
                              {isActive ? (
                                <UserCheck className="h-3 w-3" />
                              ) : (
                                <UserX className="h-3 w-3" />
                              )}
                              <span>{isActive ? 'Active' : 'Suspended'}</span>
                            </span>
                          </td>

                          {/* Joined Date */}
                          <td className="px-6 py-4 text-xs text-slate-500 hidden md:table-cell">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(user.created_at)}</span>
                            </div>
                          </td>

                          {/* Actions (FEAT-16) */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Suspend / Unsuspend Button */}
                              <button
                                onClick={() => setConfirmSuspendUser(user)}
                                disabled={isSelf}
                                title={
                                  isSelf
                                    ? 'Cannot suspend your own account'
                                    : isActive
                                    ? 'Suspend user access'
                                    : 'Reactivate user access'
                                }
                                className={clsx(
                                  'flex items-center space-x-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed',
                                  {
                                    'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100':
                                      isActive,
                                    'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100':
                                      !isActive,
                                  }
                                )}
                              >
                                {isActive ? (
                                  <>
                                    <UserX className="h-3.5 w-3.5" />
                                    <span>Suspend</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-3.5 w-3.5" />
                                    <span>Reactivate</span>
                                  </>
                                )}
                              </button>

                              {/* Delete User Button */}
                              <button
                                onClick={() => setConfirmDeleteUser(user)}
                                disabled={isSelf}
                                title={isSelf ? 'Cannot delete your own account' : 'Delete user'}
                                className="flex items-center space-x-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Suspend Confirmation Dialog */}
      {confirmSuspendUser && (
        <ConfirmDialog
          title={
            confirmSuspendUser.is_active ?? true
              ? `Suspend ${confirmSuspendUser.name}?`
              : `Reactivate ${confirmSuspendUser.name}?`
          }
          message={
            confirmSuspendUser.is_active ?? true
              ? `Suspending ${confirmSuspendUser.email} will immediately prevent them from logging in, uploading documents, or querying AI answers. You can reactivate their account anytime.`
              : `Reactivating ${confirmSuspendUser.email} will immediately restore their full access to the system.`
          }
          confirmLabel={
            confirmSuspendUser.is_active ?? true ? 'Suspend User' : 'Reactivate User'
          }
          isDestructive={confirmSuspendUser.is_active ?? true}
          isLoading={actionLoading}
          onConfirm={handleToggleSuspend}
          onCancel={() => setConfirmSuspendUser(null)}
        />
      )}

      {/* Delete User Confirmation Dialog */}
      {confirmDeleteUser && (
        <ConfirmDialog
          title={`Delete ${confirmDeleteUser.name}?`}
          message={`Are you sure you want to permanently delete ${confirmDeleteUser.email}? This action CANNOT be undone. All their uploaded documents, chunks, dense vector embeddings, and Q&A history records will be completely removed.`}
          confirmLabel="Delete User Permanently"
          isDestructive
          isLoading={actionLoading}
          onConfirm={handleDeleteUser}
          onCancel={() => setConfirmDeleteUser(null)}
        />
      )}
    </ProtectedRoute>
  );
}
