/**
 * T-M3-4.C.2.1 — Page renders user table with role, status, last sign-in, added date, actions menu
 * T-M3-4.C.2.2 — Page has no slot UI elements (regression guard for stream-boundary)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { clientAdminProfile } from '@/test/fixtures/clientAdmin';
import type { UserProfile } from '@/lib/auth/context';

// ─── Stubs ────────────────────────────────────────────────────────────────────

const mockSetBreadcrumbs = vi.fn();

vi.mock('jotai', () => ({
  useSetAtom: () => mockSetBreadcrumbs,
  useAtom: () => [false, vi.fn()],
  atom: (val: unknown) => ({ init: val }),
}));

vi.mock('@/store/atoms/header', () => ({
  headerBreadcrumbsAtom: { __type: 'atom' },
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
    })),
    auth: { getUser: vi.fn() },
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
  },
}));

vi.mock('@/lib/db/admin-operations', () => ({
  getCompanyUsers: vi.fn().mockResolvedValue([
    {
      userId: 'user-1',
      fullName: 'Alice Admin',
      email: 'alice@example.com',
      role: 'client_admin',
      companyId: 'company-a',
      companyName: 'Company A',
      isActive: true,
      createdAt: '2024-01-01',
    },
    {
      userId: 'user-2',
      fullName: 'Bob User',
      email: 'bob@example.com',
      role: 'client_user',
      companyId: 'company-a',
      companyName: 'Company A',
      isActive: false,
      createdAt: '2024-01-02',
    },
  ]),
}));

vi.mock('@/lib/db/client-operations', () => ({
  registerCompanyUser: vi.fn(),
  updateCompanyUser: vi.fn(),
  setCompanyUserActive: vi.fn(),
  resendCompanyUserInvite: vi.fn(),
  resetCompanyUserAccess: vi.fn(),
}));

// ─── Auth mock ────────────────────────────────────────────────────────────────

let mockAuthProfile: UserProfile | null = null;

vi.mock('@/lib/auth/context', () => ({
  useAuth: () => ({
    user: mockAuthProfile ? { id: mockAuthProfile.user_id } : null,
    profile: mockAuthProfile,
    loading: false,
    signOut: vi.fn(),
    signIn: vi.fn(),
    signInWithOtp: vi.fn(),
    verifyOtp: vi.fn(),
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setAuth(profile: UserProfile | null) {
  mockAuthProfile = profile;
}

beforeEach(() => {
  vi.clearAllMocks();
  setAuth(clientAdminProfile);
});

// ─── Lazy imports ─────────────────────────────────────────────────────────────

import CompanyUsers from './index';

// ─────────────────────────────────────────────────────────────────────────────
// T-M3-4.C.2.1 — Page renders user table
// ─────────────────────────────────────────────────────────────────────────────

describe('T-M3-4.C.2.1 — Page renders user table', () => {
  it('renders users with name, email columns', async () => {
    render(
      <MemoryRouter initialEntries={['/company/users']}>
        <CompanyUsers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('Bob User')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });
  });

  it('renders status badges for users', async () => {
    render(
      <MemoryRouter initialEntries={['/company/users']}>
        <CompanyUsers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  it('renders Register User button', async () => {
    render(
      <MemoryRouter initialEntries={['/company/users']}>
        <CompanyUsers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /register user/i })).toBeInTheDocument();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T-M3-4.C.2.2 — No slot UI on /company/users
// ─────────────────────────────────────────────────────────────────────────────

describe('T-M3-4.C.2.2 — No slot UI on /company/users', () => {
  it('does not render slot request button', async () => {
    render(
      <MemoryRouter initialEntries={['/company/users']}>
        <CompanyUsers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /request more slots/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /request slots/i })).not.toBeInTheDocument();
    });
  });

  it('does not render slot request dialog', async () => {
    render(
      <MemoryRouter initialEntries={['/company/users']}>
        <CompanyUsers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/request additional slots/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/slot requests/i)).not.toBeInTheDocument();
    });
  });
});