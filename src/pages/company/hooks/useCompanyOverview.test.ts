/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCompanyOverview } from './useCompanyOverview';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/db/supabase';

vi.mock('@/lib/auth/context', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/db/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('useCompanyOverview hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves successful promise.all correctly (T-M3-4.B.1.1)', async () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: { company_id: 'comp-one' } as any,
      user: { id: 'usr-one' } as any,
      session: null,
      loading: false,
      signOut: vi.fn(),
      signIn: vi.fn(),
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
    });

    const mockFrom = vi.fn().mockImplementation((table) => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(),
      };

      if (table === 'companies') {
        chain.maybeSingle = vi.fn().mockResolvedValue({
          data: { id: 'comp-one', name: 'Company One', max_user_slots: 15, is_active: true },
          error: null,
        });
      } else if (table === 'user_profiles') {
        chain.maybeSingle = vi.fn().mockResolvedValue({
          data: [{ is_active: true }, { is_active: false }],
          count: 2,
          error: null,
        } as any);
        // over-ride to make user_profiles support full data list
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: [{ is_active: true }, { is_active: false }],
            count: 2,
            error: null,
          } as any),
        };
      } else if (table === 'slot_requests') {
        chain.maybeSingle = vi.fn().mockResolvedValue({
          data: null,
          error: null,
        });
      } else if (table === 'admin_activity_log') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        } as any;
      }
      return chain;
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom as any);

    const { result } = renderHook(() => useCompanyOverview());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data.company?.name).toBe('Company One');
    expect(result.current.data.totalUsers).toBe(2);
    expect(result.current.data.activeUsers).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('surfaces error if reading slices fails (T-M3-4.B.1.2)', async () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: { company_id: 'comp-one' } as any,
      user: { id: 'usr-one' } as any,
      session: null,
      loading: false,
      signOut: vi.fn(),
      signIn: vi.fn(),
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
    });

    const mockFrom = vi.fn().mockImplementation((table) => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(),
        then: vi.fn(),
      } as any;

      if (table === 'companies') {
        chain.maybeSingle = vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database failure' },
        });
      } else if (table === 'user_profiles') {
        chain.eq = vi.fn().mockResolvedValue({
          data: [],
          count: 0,
          error: null,
        });
      } else if (table === 'admin_activity_log') {
        chain.limit = vi.fn().mockResolvedValue({
          data: [],
          error: null,
        });
      } else {
        chain.maybeSingle = vi.fn().mockResolvedValue({
          data: null,
          error: null,
        });
      }
      return chain;
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom as any);

    const { result } = renderHook(() => useCompanyOverview());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Some data slices failed to load properly.');
  });

  it('detects inactive company state (T-M3-4.B.1.3)', async () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: { company_id: 'comp-inactive' } as any,
      user: { id: 'usr-one' } as any,
      session: null,
      loading: false,
      signOut: vi.fn(),
      signIn: vi.fn(),
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
    });

    const mockFrom = vi.fn().mockImplementation((table) => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(),
      } as any;

      if (table === 'companies') {
        chain.maybeSingle = vi.fn().mockResolvedValue({
          data: { id: 'comp-inactive', name: 'Inactive Co', max_user_slots: 10, is_active: false },
          error: null,
        });
      } else if (table === 'user_profiles') {
        chain.eq = vi.fn().mockResolvedValue({
          data: [],
          count: 5,
          error: null,
        });
      } else if (table === 'slot_requests') {
        chain.maybeSingle = vi.fn().mockResolvedValue({
          data: null,
          error: null,
        });
      } else if (table === 'admin_activity_log') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        } as any;
      }
      return chain;
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom as any);

    const { result } = renderHook(() => useCompanyOverview());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data.company?.isActive).toBe(false);
  });
});
