import { useEffect, useState, useCallback } from 'react';
import {
  getAdminDashboardCounts,
  getRecentActivity,
  getPendingSlotRequests,
  type AdminDashboardCounts,
  type ActivityLogEntry,
  type SlotRequest,
} from '@/lib/db/admin-operations';

interface AdminDashboardState {
  counts: AdminDashboardCounts | null;
  recentActivity: ActivityLogEntry[];
  pendingSlotRequests: SlotRequest[];
  loading: boolean;
  error: string | null;
}

export function useAdminDashboard() {
  const [state, setState] = useState<AdminDashboardState>({
    counts: null,
    recentActivity: [],
    pendingSlotRequests: [],
    loading: true,
    error: null,
  });

  const loadDashboard = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [counts, recentActivity, pendingSlotRequests] = await Promise.all([
        getAdminDashboardCounts(),
        getRecentActivity(10),
        getPendingSlotRequests(),
      ]);

      setState({
        counts,
        recentActivity,
        pendingSlotRequests,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load dashboard',
      }));
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return { ...state, refresh: loadDashboard };
}
