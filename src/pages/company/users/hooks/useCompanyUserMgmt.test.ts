/**
 * T-M3-4.C.1.1 — useCompanyUserMgmt filtering tests
 * T-M3-4.C.1.2 — useCompanyUserMgmt pendingAction mediates single-dialog behaviour
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { AdminUser } from '@/lib/db/admin-operations';

// Define mock data at module scope
const mockUsers: AdminUser[] = [
  {
    userId: 'user-1',
    fullName: 'Alice Admin',
    email: 'alice@example.com',
    role: 'client_admin',
    companyId: 'company-a',
    companyName: 'Company A',
    isActive: true,
    createdAt: '2024-01-01',
    lastSignIn: null,
  },
  {
    userId: 'user-2',
    fullName: 'Bob User',
    email: 'bob@example.com',
    role: 'client_user',
    companyId: 'company-a',
    companyName: 'Company A',
    isActive: true,
    createdAt: '2024-01-02',
    lastSignIn: null,
  },
  {
    userId: 'user-3',
    fullName: 'Charlie Client',
    email: 'charlie@example.com',
    role: 'client_user',
    companyId: 'company-a',
    companyName: 'Company A',
    isActive: false,
    createdAt: '2024-01-03',
    lastSignIn: null,
  },
];

const mockCompany = {
  id: 'company-a',
  name: 'Company A',
  country: 'US',
  insuranceType: 'motor' as const,
  maxUserSlots: 10,
  isActive: true,
  createdAt: '2024-01-01',
  createdBy: null,
};

// Mock auth context with configurable profile
let mockProfile: { role: 'client_admin'; company_id: string; user_id: string; full_name: string; is_active: true } | null = null;

vi.mock('@/lib/auth/context', () => ({
  useAuth: () => ({
    profile: mockProfile,
    user: mockProfile ? { id: mockProfile.user_id } : null,
    loading: false,
  }),
}));

vi.mock('@/lib/db/admin-operations', () => ({
  getCompanyUsers: vi.fn().mockImplementation(() => Promise.resolve(mockUsers)),
  getCompany: vi.fn().mockImplementation(() => Promise.resolve(mockCompany)),
}));

vi.mock('jotai', () => ({
  useSetAtom: () => vi.fn(),
}));

describe('T-M3-4.C.1.1 — useCompanyUserMgmt filtering', () => {
  beforeEach(() => {
    mockProfile = {
      user_id: 'current-user',
      role: 'client_admin',
      company_id: 'company-a',
      full_name: 'Current User',
      is_active: true,
    };
    vi.clearAllMocks();
  });

  it('filters users by name search', async () => {
    const { useCompanyUserMgmt } = await import('./useCompanyUserMgmt');
    const { result } = renderHook(() => useCompanyUserMgmt());

    // Wait for initial load
    await vi.waitFor(() => expect(result.current.users).toHaveLength(3));

    // Search by name
    act(() => {
      result.current.setSearch('Alice');
    });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].fullName).toBe('Alice Admin');
  });

  it('filters users by email search', async () => {
    const { useCompanyUserMgmt } = await import('./useCompanyUserMgmt');
    const { result } = renderHook(() => useCompanyUserMgmt());

    await vi.waitFor(() => expect(result.current.users).toHaveLength(3));

    act(() => {
      result.current.setSearch('charlie@example.com');
    });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].userId).toBe('user-3');
  });

  it('filters users by role search', async () => {
    const { useCompanyUserMgmt } = await import('./useCompanyUserMgmt');
    const { result } = renderHook(() => useCompanyUserMgmt());

    await vi.waitFor(() => expect(result.current.users).toHaveLength(3));

    act(() => {
      result.current.setSearch('client_user');
    });
    expect(result.current.filtered).toHaveLength(2);
  });

  it('returns empty when no matches', async () => {
    const { useCompanyUserMgmt } = await import('./useCompanyUserMgmt');
    const { result } = renderHook(() => useCompanyUserMgmt());

    await vi.waitFor(() => expect(result.current.users).toHaveLength(3));

    act(() => {
      result.current.setSearch('nonexistent@example.com');
    });
    expect(result.current.filtered).toHaveLength(0);
  });

  it('clears search to show all users', async () => {
    const { useCompanyUserMgmt } = await import('./useCompanyUserMgmt');
    const { result } = renderHook(() => useCompanyUserMgmt());

    await vi.waitFor(() => expect(result.current.users).toHaveLength(3));

    act(() => {
      result.current.setSearch('Alice');
    });
    expect(result.current.filtered).toHaveLength(1);

    act(() => {
      result.current.setSearch('');
    });
    expect(result.current.filtered).toHaveLength(3);
  });

  it('exposes company data including maxUserSlots', async () => {
    const { useCompanyUserMgmt } = await import('./useCompanyUserMgmt');
    const { result } = renderHook(() => useCompanyUserMgmt());

    await vi.waitFor(() => expect(result.current.company).not.toBeNull());
    expect(result.current.company?.maxUserSlots).toBe(10);
  });
});

describe('T-M3-4.C.1.2 — useCompanyUserMgmt pendingAction mediates single-dialog behaviour', () => {
  beforeEach(() => {
    mockProfile = {
      user_id: 'current-user',
      role: 'client_admin',
      company_id: 'company-a',
      full_name: 'Current User',
      is_active: true,
    };
    vi.clearAllMocks();
  });

  it('starts with no pending action', async () => {
    const { useCompanyUserMgmt } = await import('./useCompanyUserMgmt');
    const { result } = renderHook(() => useCompanyUserMgmt());

    expect(result.current.pendingAction).toBeNull();
  });

  it('can set pending action to register', async () => {
    const { useCompanyUserMgmt } = await import('./useCompanyUserMgmt');
    const { result } = renderHook(() => useCompanyUserMgmt());

    act(() => {
      result.current.setPendingAction({ type: 'register' });
    });
    expect(result.current.pendingAction).toEqual({ type: 'register' });
  });

  it('can set pending action to edit user', async () => {
    const { useCompanyUserMgmt } = await import('./useCompanyUserMgmt');
    const { result } = renderHook(() => useCompanyUserMgmt());

    act(() => {
      result.current.setPendingAction({ type: 'edit', userId: 'user-1' });
    });
    expect(result.current.pendingAction).toEqual({ type: 'edit', userId: 'user-1' });
  });

  it('can set pending action to toggle status', async () => {
    const { useCompanyUserMgmt } = await import('./useCompanyUserMgmt');
    const { result } = renderHook(() => useCompanyUserMgmt());

    act(() => {
      result.current.setPendingAction({ type: 'toggle', userId: 'user-2' });
    });
    expect(result.current.pendingAction).toEqual({ type: 'toggle', userId: 'user-2' });
  });

  it('can set pending action to resend invite', async () => {
    const { useCompanyUserMgmt } = await import('./useCompanyUserMgmt');
    const { result } = renderHook(() => useCompanyUserMgmt());

    act(() => {
      result.current.setPendingAction({ type: 'resend_invite', userId: 'user-3' });
    });
    expect(result.current.pendingAction).toEqual({ type: 'resend_invite', userId: 'user-3' });
  });

  it('can set pending action to reset access', async () => {
    const { useCompanyUserMgmt } = await import('./useCompanyUserMgmt');
    const { result } = renderHook(() => useCompanyUserMgmt());

    act(() => {
      result.current.setPendingAction({ type: 'reset_access', userId: 'user-3' });
    });
    expect(result.current.pendingAction).toEqual({ type: 'reset_access', userId: 'user-3' });
  });

  it('clears pending action when a new one is set', async () => {
    const { useCompanyUserMgmt } = await import('./useCompanyUserMgmt');
    const { result } = renderHook(() => useCompanyUserMgmt());

    act(() => {
      result.current.setPendingAction({ type: 'edit', userId: 'user-1' });
    });
    expect(result.current.pendingAction).toEqual({ type: 'edit', userId: 'user-1' });

    act(() => {
      result.current.setPendingAction({ type: 'register' });
    });
    expect(result.current.pendingAction).toEqual({ type: 'register' });
  });
});
