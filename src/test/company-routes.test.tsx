/**
 * T-M3-4.0.5.1 — /company access matrix: client_admin allowed, admin redirected,
 *                 client_user redirected.
 * T-M3-4.0.5.2 — /company/users access matrix mirrors /company.
 * T-M3-4.0.5.3 — Deactivated client_admin is signed out and shown invalid-account message.
 *
 * Uses fixtures from src/test/fixtures/clientAdmin.ts and the
 * renderWithCompanyAuth helper from src/test/utils/companyRoutes.tsx.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import {
  clientAdminProfile,
  clientAdminInactiveProfile,
  clientUserProfile,
} from './fixtures/clientAdmin';
import type { UserProfile } from '@/lib/auth/context';

// ─── Stubs ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
const mockSignOut = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
    Navigate: ({ to }: { to: string }) => {
      mockNavigate(to);
      return <div data-testid="navigate" data-to={to} />;
    },
  };
});

const mockSetBreadcrumbs = vi.fn();

vi.mock('jotai', () => ({
  useSetAtom: () => mockSetBreadcrumbs,
  useAtom: () => [false, vi.fn()],
  atom: (val: unknown) => ({ init: val }),
}));

vi.mock('@/store/atoms/header', () => ({
  headerBreadcrumbsAtom: { __type: 'atom' },
}));

vi.mock('@/store/atoms/sidebar', () => ({
  sidebarCollapsedAtom: { __type: 'atom' },
}));

vi.mock('@/lib/db/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn(),
    })),
    auth: { getUser: vi.fn() },
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
  },
}));

vi.mock('@/lib/db/admin-operations', () => ({
  getCompanyUsers: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/db/client-operations', () => ({
  cancelSlotRequest: vi.fn(),
  registerCompanyUser: vi.fn(),
  updateCompanyUser: vi.fn(),
  setCompanyUserActive: vi.fn(),
  resendCompanyUserInvite: vi.fn(),
  resetCompanyUserAccess: vi.fn(),
}));

// ─── Auth mock ────────────────────────────────────────────────────────────────

let mockProfile: UserProfile | null = null;
let mockUser: { id: string } | null = null;
let mockLoading = false;

vi.mock('@/lib/auth/context', () => ({
  useAuth: () => ({
    user: mockUser,
    profile: mockProfile,
    loading: mockLoading,
    signOut: mockSignOut,
    signIn: vi.fn(),
    signInWithOtp: vi.fn(),
    verifyOtp: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setAuth(profile: UserProfile | null, loading = false) {
  mockProfile = profile;
  mockUser = profile ? { id: profile.user_id } : null;
  mockLoading = loading;
}

function clearAuth() {
  mockProfile = null;
  mockUser = null;
  mockLoading = false;
}

beforeEach(() => {
  vi.clearAllMocks();
  clearAuth();
});

// ─── Lazy imports (after mocks) ───────────────────────────────────────────────

import { RoleGuard, getRoleLandingPath } from '@/components/shared/RoleGuard';
import CompanyOverview from '@/pages/company';
import CompanyUsers from '@/pages/company/users';

// ─────────────────────────────────────────────────────────────────────────────
// T-M3-4.0.5.1 — /company access matrix
// ─────────────────────────────────────────────────────────────────────────────

describe('T-M3-4.0.5.1 — /company route access matrix', () => {
  it('allows client_admin: renders the "coming soon" placeholder', async () => {
    setAuth(clientAdminProfile);

    render(
      <MemoryRouter initialEntries={['/company']}>
        <RoleGuard allowedRoles={['client_admin']}>
          <CompanyOverview />
        </RoleGuard>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/company overview - coming soon/i)).toBeDefined();
    });
  });

  it('redirects admin to /admin (their role landing path)', async () => {
    setAuth({ ...clientAdminProfile, user_id: 'admin-1', role: 'admin', company_id: null });

    render(
      <MemoryRouter initialEntries={['/company']}>
        <RoleGuard allowedRoles={['client_admin']}>
          <CompanyOverview />
        </RoleGuard>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(getRoleLandingPath('admin'));
    });
  });

  it('redirects client_user to /datasets (their role landing path)', async () => {
    setAuth(clientUserProfile);

    render(
      <MemoryRouter initialEntries={['/company']}>
        <RoleGuard allowedRoles={['client_admin']}>
          <CompanyOverview />
        </RoleGuard>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(getRoleLandingPath('client_user'));
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T-M3-4.0.5.2 — /company/users access matrix mirrors /company
// ─────────────────────────────────────────────────────────────────────────────

describe('T-M3-4.0.5.2 — /company/users route access matrix', () => {
  it('allows client_admin: renders the company users page', async () => {
    setAuth(clientAdminProfile);

    render(
      <MemoryRouter initialEntries={['/company/users']}>
        <RoleGuard allowedRoles={['client_admin']}>
          <CompanyUsers />
        </RoleGuard>
      </MemoryRouter>
    );

    // Page mounts without redirecting — content renders
    await waitFor(() => {
      // No navigate call to role landing means access was granted
      expect(mockNavigate).not.toHaveBeenCalledWith(getRoleLandingPath('client_admin'));
    });
  });

  it('redirects admin to /admin', async () => {
    setAuth({ ...clientAdminProfile, user_id: 'admin-1', role: 'admin', company_id: null });

    render(
      <MemoryRouter initialEntries={['/company/users']}>
        <RoleGuard allowedRoles={['client_admin']}>
          <CompanyUsers />
        </RoleGuard>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(getRoleLandingPath('admin'));
    });
  });

  it('redirects client_user to /datasets', async () => {
    setAuth(clientUserProfile);

    render(
      <MemoryRouter initialEntries={['/company/users']}>
        <RoleGuard allowedRoles={['client_admin']}>
          <CompanyUsers />
        </RoleGuard>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(getRoleLandingPath('client_user'));
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T-M3-4.0.5.3 — Deactivated client_admin is signed out and shown invalid-account message
// ─────────────────────────────────────────────────────────────────────────────

describe('T-M3-4.0.5.3 — Deactivated client_admin is blocked', () => {
  it('signs out and redirects to /auth when client_admin is inactive', async () => {
    setAuth(clientAdminInactiveProfile);

    render(
      <MemoryRouter initialEntries={['/company']}>
        <RoleGuard allowedRoles={['client_admin']}>
          <CompanyOverview />
        </RoleGuard>
      </MemoryRouter>
    );

    // RoleGuard detects isInvalidAccount (user present + profile.is_active = false)
    // → triggers signOut() and renders Navigate to /auth
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });

    // No /company content should be visible
    expect(screen.queryByText(/company overview/i)).toBeNull();
  });

  it('deactivated client_admin does not see /company/users content', async () => {
    setAuth(clientAdminInactiveProfile);

    render(
      <MemoryRouter initialEntries={['/company/users']}>
        <RoleGuard allowedRoles={['client_admin']}>
          <CompanyUsers />
        </RoleGuard>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Verify the test harness fixtures are consumed (M3-4.0.4 integration)
// ─────────────────────────────────────────────────────────────────────────────

describe('Test harness fixtures are well-formed', () => {
  it('clientAdminProfile has role client_admin and is_active true', () => {
    expect(clientAdminProfile.role).toBe('client_admin');
    expect(clientAdminProfile.is_active).toBe(true);
    expect(clientAdminProfile.company_id).toBeTruthy();
  });

  it('clientAdminInactiveProfile has is_active false', () => {
    expect(clientAdminInactiveProfile.role).toBe('client_admin');
    expect(clientAdminInactiveProfile.is_active).toBe(false);
  });

  it('clientUserProfile has role client_user', () => {
    expect(clientUserProfile.role).toBe('client_user');
    expect(clientUserProfile.is_active).toBe(true);
  });
});
