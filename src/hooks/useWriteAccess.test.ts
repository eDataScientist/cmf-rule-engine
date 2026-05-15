import { describe, it, expect, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { renderHook } from '@testing-library/react';
import { useWriteAccess } from './useWriteAccess';
import { useAuth } from '@/lib/auth/context';

vi.mock('@/lib/auth/context');

const mockUser: User = {
  id: 'user-1',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'admin@test.com',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as unknown as User;

describe('useWriteAccess', () => {
  it('returns canWrite=true for admin role', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      profile: {
        user_id: 'user-1',
        role: 'admin',
        company_id: null,
        full_name: 'Admin User',
        is_active: true,
      },
      loading: false,
      signIn: vi.fn(),
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    });

    const { result } = renderHook(() => useWriteAccess());

    expect(result.current.canWrite).toBe(true);
    expect(result.current.role).toBe('admin');
  });

  it('returns canWrite=true for client_admin role', () => {
    const mockUser2: User = { ...mockUser, id: 'user-2', email: 'client-admin@test.com' } as unknown as User;
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser2,
      session: null,
      profile: {
        user_id: 'user-2',
        role: 'client_admin',
        company_id: 'company-1',
        full_name: 'Client Admin',
        is_active: true,
      },
      loading: false,
      signIn: vi.fn(),
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    });

    const { result } = renderHook(() => useWriteAccess());

    expect(result.current.canWrite).toBe(true);
    expect(result.current.role).toBe('client_admin');
  });

  it('returns canWrite=false for client_user role', () => {
    const mockUser3: User = { ...mockUser, id: 'user-3', email: 'client-user@test.com' } as unknown as User;
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser3,
      session: null,
      profile: {
        user_id: 'user-3',
        role: 'client_user',
        company_id: 'company-1',
        full_name: 'Client User',
        is_active: true,
      },
      loading: false,
      signIn: vi.fn(),
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    });

    const { result } = renderHook(() => useWriteAccess());

    expect(result.current.canWrite).toBe(false);
    expect(result.current.role).toBe('client_user');
  });

  it('returns canWrite=false and null role when unauthenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      profile: null,
      loading: false,
      signIn: vi.fn(),
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    });

    const { result } = renderHook(() => useWriteAccess());

    expect(result.current.canWrite).toBe(false);
    expect(result.current.role).toBe(null);
  });

  it('returns canWrite=false when loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      profile: null,
      loading: true,
      signIn: vi.fn(),
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    });

    const { result } = renderHook(() => useWriteAccess());

    expect(result.current.canWrite).toBe(false);
    expect(result.current.role).toBe(null);
  });
});
