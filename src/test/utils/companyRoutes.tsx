/**
 * M3-4.0.4 — Shared client-route test harness
 *
 * Provides:
 *   - renderWithCompanyAuth: renders a component inside MemoryRouter +
 *     a mocked AuthProvider scoped to a given UserProfile.
 *   - mockSlotRequests: vi.fn() stub for supabase slot_requests table.
 *   - mockActivityLog: vi.fn() stub for supabase admin_activity_log table.
 *
 * Usage:
 *   import { renderWithCompanyAuth, mockSlotRequests, mockActivityLog }
 *     from '@/../src/test/utils/companyRoutes';
 *
 *   renderWithCompanyAuth(<MyComponent />, { profile: clientAdminProfile });
 */

import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { UserProfile } from '@/lib/auth/context';

// ─── Supabase stub helpers ────────────────────────────────────────────────────

/**
 * Vitest mock for the supabase `slot_requests` table query chain.
 * Replace .mockResolvedValue() return to control test data per test.
 *
 * @example
 *   mockSlotRequests.mockResolvedValueOnce([{ id: 'req-1', status: 'pending', ... }]);
 */
export const mockSlotRequests = vi.fn().mockResolvedValue([]);

/**
 * Vitest mock for the supabase `admin_activity_log` table query chain.
 * Replace .mockResolvedValue() return to control test data per test.
 *
 * @example
 *   mockActivityLog.mockResolvedValueOnce({ entries: [...], total: 1 });
 */
export const mockActivityLog = vi.fn().mockResolvedValue({ entries: [], total: 0 });

// ─── AuthContext stub ─────────────────────────────────────────────────────────

interface AuthStub {
  user: { id: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: ReturnType<typeof vi.fn>;
  signIn: ReturnType<typeof vi.fn>;
  signInWithOtp: ReturnType<typeof vi.fn>;
  verifyOtp: ReturnType<typeof vi.fn>;
}

function buildAuthStub(profile: UserProfile | null): AuthStub {
  return {
    user: profile ? { id: profile.user_id } : null,
    profile,
    loading: false,
    signOut: vi.fn().mockResolvedValue(undefined),
    signIn: vi.fn().mockResolvedValue({ error: null }),
    signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    verifyOtp: vi.fn().mockResolvedValue({ error: null }),
  };
}

// ─── Render helper ────────────────────────────────────────────────────────────

interface RenderOptions {
  /** The UserProfile to inject into the mocked AuthContext. Pass null for unauthenticated. */
  profile: UserProfile | null;
  /** The initial path for MemoryRouter. Defaults to '/company'. */
  initialPath?: string;
}

/**
 * Renders a component inside a MemoryRouter and a minimal AuthContext stub
 * so tests can exercise components that depend on the auth context and routing.
 *
 * Stubs out jotai setters and the supabase client. Tests that need to assert
 * on navigation should mock react-router-dom's Navigate before calling this.
 */
export function renderWithCompanyAuth(
  ui: React.ReactElement,
  { profile, initialPath = '/company' }: RenderOptions
) {
  const authStub = buildAuthStub(profile);

  // Inject the auth stub via module mock (caller must have set up vi.mock('@/lib/auth/context'))
  // This helper sets the __mockAuth export that the mock factory reads.
  const globalSetMockAuth = (globalThis as Record<string, unknown>).__setMockAuth;
  if (typeof globalSetMockAuth === 'function') {
    globalSetMockAuth(authStub);
  }

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      {ui}
    </MemoryRouter>
  );
}

/**
 * Returns an auth stub object for direct use in vi.mock factories.
 * Useful when the test controls the mock setup manually.
 */
export function makeAuthStub(profile: UserProfile | null): AuthStub {
  return buildAuthStub(profile);
}
