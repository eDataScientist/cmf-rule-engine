/**
 * M3-4.C.1 — useCompanyUserMgmt hook
 *
 * Centralizes user management state for the /company/users page.
 * Provides users list, search filtering, and pending action management.
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { getCompanyUsers, getCompany, type AdminUser, type Company } from '@/lib/db/admin-operations';

export type PendingAction =
  | { type: 'register' }
  | { type: 'edit'; userId: string }
  | { type: 'toggle'; userId: string }
  | { type: 'resend_invite'; userId: string }
  | { type: 'reset_access'; userId: string };

export interface UseCompanyUserMgmtResult {
  users: AdminUser[];
  filtered: AdminUser[];
  search: string;
  setSearch: (search: string) => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  pendingAction: PendingAction | null;
  setPendingAction: (action: PendingAction | null) => void;
  company: Company | null;
}

export function useCompanyUserMgmt(): UseCompanyUserMgmtResult {
  const { profile } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingActionState] = useState<PendingAction | null>(null);

  const loadUsers = useCallback(async () => {
    if (!profile?.company_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [usersData, companyData] = await Promise.all([
        getCompanyUsers(profile.company_id),
        getCompany(profile.company_id),
      ]);
      setUsers(usersData);
      setCompany(companyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [profile?.company_id]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  // Filtered users based on search
  const filtered = search.trim()
    ? users.filter(
        (u) =>
          (u.fullName ?? '').toLowerCase().includes(search.toLowerCase()) ||
          (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
          u.role.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const setPendingAction = useCallback((action: PendingAction | null) => {
    setPendingActionState(action);
  }, []);

  return {
    users,
    filtered,
    search,
    setSearch,
    loading,
    error,
    refresh: loadUsers,
    pendingAction,
    setPendingAction,
    company,
  };
}
