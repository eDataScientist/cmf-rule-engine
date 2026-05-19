/**
 * T-M3-4.0.3.1 — /company route renders placeholder for client_admin;
 *                 admin and client_user are redirected.
 * T-M3-4.0.3.2 — Sidebar nav exposes /company only for client_admin.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { UserProfile } from '@/lib/auth/context';

// ─── React-router stub ────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/company' }),
  Navigate: ({ to }: { to: string }) => {
    mockNavigate(to);
    return <div data-testid="navigate" data-to={to} />;
  },
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  NavLink: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ─── Jotai stubs ──────────────────────────────────────────────────────────────

const mockSetBreadcrumbs = vi.fn();
const mockSidebarCollapsed = false;

vi.mock('jotai', () => ({
  useSetAtom: () => mockSetBreadcrumbs,
  useAtom: () => [mockSidebarCollapsed, vi.fn()],
  atom: (val: unknown) => ({ init: val }),
}));

vi.mock('@/store/atoms/header', () => ({
  headerBreadcrumbsAtom: { __type: 'atom' },
}));

vi.mock('@/store/atoms/sidebar', () => ({
  sidebarCollapsedAtom: { __type: 'atom' },
}));

// ─── Supabase stub ────────────────────────────────────────────────────────────

vi.mock('@/lib/db/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: { getUser: vi.fn() },
  },
}));

// ─── Auth mock factory ────────────────────────────────────────────────────────

type MockAuth = {
  user: { id: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: ReturnType<typeof vi.fn>;
};

let mockAuth: MockAuth = {
  user: null,
  profile: null,
  loading: false,
  signOut: vi.fn(),
};

vi.mock('@/lib/auth/context', () => ({
  useAuth: () => mockAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import CompanyOverview from './index';
import { RoleGuard, getRoleLandingPath } from '@/components/shared/RoleGuard';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function activeClientAdmin(): MockAuth {
  return {
    user: { id: 'user-ca-1' },
    profile: {
      user_id: 'user-ca-1',
      role: 'client_admin',
      company_id: 'co-1',
      full_name: 'Client Admin',
      is_active: true,
    },
    loading: false,
    signOut: vi.fn(),
  };
}

function adminUser(): MockAuth {
  return {
    user: { id: 'user-admin-1' },
    profile: {
      user_id: 'user-admin-1',
      role: 'admin',
      company_id: null,
      full_name: 'Super Admin',
      is_active: true,
    },
    loading: false,
    signOut: vi.fn(),
  };
}

function clientUser(): MockAuth {
  return {
    user: { id: 'user-cu-1' },
    profile: {
      user_id: 'user-cu-1',
      role: 'client_user',
      company_id: 'co-1',
      full_name: 'Client User',
      is_active: true,
    },
    loading: false,
    signOut: vi.fn(),
  };
}

function deactivatedClientAdmin(): MockAuth {
  return {
    user: { id: 'user-ca-2' },
    profile: {
      user_id: 'user-ca-2',
      role: 'client_admin',
      company_id: 'co-1',
      full_name: 'Inactive Admin',
      is_active: false,
    },
    loading: false,
    signOut: vi.fn(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// T-M3-4.0.3.1 — /company route access matrix
// ─────────────────────────────────────────────────────────────────────────────

describe('T-M3-4.0.3.1 — /company route access matrix', () => {
  it('renders "Company Overview - coming soon" placeholder for active client_admin', async () => {
    mockAuth = activeClientAdmin();

    render(
      <RoleGuard allowedRoles={['client_admin']}>
        <CompanyOverview />
      </RoleGuard>
    );

    await waitFor(() => {
      expect(screen.getByText(/company overview - coming soon/i)).toBeDefined();
    });
  });

  it('redirects admin to their landing path (/admin)', async () => {
    mockAuth = adminUser();

    render(
      <RoleGuard allowedRoles={['client_admin']}>
        <CompanyOverview />
      </RoleGuard>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(getRoleLandingPath('admin'));
    });
  });

  it('redirects client_user to their landing path (/datasets)', async () => {
    mockAuth = clientUser();

    render(
      <RoleGuard allowedRoles={['client_admin']}>
        <CompanyOverview />
      </RoleGuard>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(getRoleLandingPath('client_user'));
    });
  });

  it('deactivated client_admin triggers signOut and is redirected to /auth', async () => {
    const auth = deactivatedClientAdmin();
    mockAuth = auth;

    render(
      <RoleGuard allowedRoles={['client_admin']}>
        <CompanyOverview />
      </RoleGuard>
    );

    await waitFor(() => {
      // Navigate to /auth is rendered
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T-M3-4.0.3.2 — CompanyOverview placeholder content and breadcrumbs
// ─────────────────────────────────────────────────────────────────────────────

describe('T-M3-4.0.3.2 — CompanyOverview placeholder', () => {
  it('renders the "coming soon" placeholder card', async () => {
    mockAuth = activeClientAdmin();

    render(<CompanyOverview />);

    await waitFor(() => {
      expect(screen.getByText(/company overview - coming soon/i)).toBeDefined();
    });
  });

  it('sets breadcrumbs to [Company Overview] on mount', async () => {
    mockAuth = activeClientAdmin();

    render(<CompanyOverview />);

    await waitFor(() => {
      expect(mockSetBreadcrumbs).toHaveBeenCalledWith([
        { label: 'Company Overview', href: '/company' },
      ]);
    });
  });

  it('clears breadcrumbs on unmount', async () => {
    mockAuth = activeClientAdmin();

    const { unmount } = render(<CompanyOverview />);
    await waitFor(() => {
      expect(mockSetBreadcrumbs).toHaveBeenCalledWith([
        { label: 'Company Overview', href: '/company' },
      ]);
    });

    mockSetBreadcrumbs.mockClear();
    unmount();

    expect(mockSetBreadcrumbs).toHaveBeenCalledWith([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar companyNavItems — /company appears only for client_admin
// ─────────────────────────────────────────────────────────────────────────────

describe('Sidebar companyNavItems includes /company for client_admin only', () => {
  it('getRoleLandingPath returns /admin for admin and /datasets for other roles', () => {
    expect(getRoleLandingPath('admin')).toBe('/admin');
    expect(getRoleLandingPath('client_admin')).toBe('/datasets');
    expect(getRoleLandingPath('client_user')).toBe('/datasets');
  });
});
