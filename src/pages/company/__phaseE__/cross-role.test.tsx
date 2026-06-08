/**
 * T-M3-4.E.1 — Cross-role integration scenario
 *
 * Scenario: admin invites a client_admin -> client_admin signs in ->
 * registers a client_user -> submits a slot request -> cancels it ->
 * deactivates the client_user -> reactivates the client_user.
 *
 * Each step is one test in a single suite using the shared test harness.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { clientAdminProfile, COMPANY_A_ID } from '@/test/fixtures/clientAdmin';
import type { UserProfile } from '@/lib/auth/context';
import type { Company } from '@/lib/db/admin-operations';

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
    })),
    auth: { getUser: vi.fn() },
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

const mockCompany: Company = {
  id: COMPANY_A_ID,
  name: 'Company A',
  country: 'US',
  insuranceType: 'motor',
  maxUserSlots: 10,
  isActive: true,
  createdAt: '2024-01-01',
  createdBy: null,
};

vi.mock('@/lib/db/admin-operations', () => ({
  getCompanyUsers: vi.fn().mockImplementation(() => Promise.resolve([])),
  getCompany: vi.fn().mockImplementation(() => Promise.resolve(mockCompany)),
}));

const mockRegisterCompanyUser = vi.fn();
const mockSetCompanyUserActive = vi.fn();
const mockCancelSlotRequest = vi.fn();
const mockRequestCompanySlots = vi.fn();

vi.mock('@/lib/db/client-operations', () => ({
  registerCompanyUser: (...args: unknown[]) => mockRegisterCompanyUser(...args),
  updateCompanyUser: vi.fn(),
  setCompanyUserActive: (...args: unknown[]) => mockSetCompanyUserActive(...args),
  resendCompanyUserInvite: vi.fn(),
  resetCompanyUserAccess: vi.fn(),
  cancelSlotRequest: (...args: unknown[]) => mockCancelSlotRequest(...args),
  requestCompanySlots: (...args: unknown[]) => mockRequestCompanySlots(...args),
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

function setAuth(profile: UserProfile | null) {
  mockAuthProfile = profile;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockRefresh = vi.fn();

vi.mock('@/pages/company/hooks/useCompanyOverview', () => ({
  useCompanyOverview: vi.fn(),
}));

import { useCompanyOverview } from '@/pages/company/hooks/useCompanyOverview';
import CompanyOverview from '@/pages/company';
import CompanyUsers from '@/pages/company/users';

function renderCompanyOverview() {
  return render(
    <MemoryRouter initialEntries={['/company']}>
      <CompanyOverview />
    </MemoryRouter>
  );
}

function renderCompanyUsers() {
  return render(
    <MemoryRouter initialEntries={['/company/users']}>
      <CompanyUsers />
    </MemoryRouter>
  );
}

function setupOverviewMock(overrides: Record<string, unknown> = {}) {
  vi.mocked(useCompanyOverview).mockReturnValue({
    data: {
      company: { id: COMPANY_A_ID, name: 'Company A', maxUserSlots: 10, isActive: true },
      totalUsers: 1,
      activeUsers: 1,
      pendingRequest: null,
      activities: [],
      ...overrides,
    },
    loading: false,
    error: null,
    refresh: mockRefresh,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setAuth(clientAdminProfile);
  mockRegisterCompanyUser.mockReset();
  mockSetCompanyUserActive.mockReset();
  mockCancelSlotRequest.mockReset();
  mockRequestCompanySlots.mockReset();
  setupOverviewMock();
});

// ─────────────────────────────────────────────────────────────────────────────
// T-M3-4.E.1 — Cross-role integration scenario
// ─────────────────────────────────────────────────────────────────────────────

describe('T-M3-4.E.1 — Cross-role integration scenario', () => {
  it('Step 1: admin invites a client_admin — fixture is well-formed', () => {
    expect(clientAdminProfile.role).toBe('client_admin');
    expect(clientAdminProfile.is_active).toBe(true);
    expect(clientAdminProfile.company_id).toBe(COMPANY_A_ID);
  });

  it('Step 2: client_admin signs in and lands on /company overview', async () => {
    setAuth(clientAdminProfile);
    renderCompanyOverview();

    await waitFor(() => {
      expect(screen.getByText('Total Slots')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Available Slots')).toBeInTheDocument();
    });
  });

  it('Step 3: client_admin registers a client_user', async () => {
    const { getCompanyUsers } = await import('@/lib/db/admin-operations');
    vi.mocked(getCompanyUsers).mockResolvedValue([
      {
        userId: clientAdminProfile.user_id,
        fullName: 'Alice Admin',
        email: 'alice@example.com',
        role: 'client_admin',
        companyId: COMPANY_A_ID,
        companyName: 'Company A',
        isActive: true,
        createdAt: '2024-01-01',
        lastSignIn: null,
      },
    ]);

    mockRegisterCompanyUser.mockResolvedValue({
      ok: true,
      data: { userId: 'new-client-user', email: 'new@example.com', companyId: COMPANY_A_ID, role: 'client_user' },
    });

    setAuth(clientAdminProfile);
    renderCompanyUsers();

    await waitFor(() => expect(screen.getByRole('button', { name: /register user/i })).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /register user/i }));

    await waitFor(() => expect(screen.getByLabelText(/email/i)).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText(/email/i), 'new@example.com');
    await userEvent.type(screen.getByLabelText(/full name/i), 'New Client User');

    await userEvent.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(mockRegisterCompanyUser).toHaveBeenCalledWith('new@example.com', 'New Client User', 'client_user');
    });
  });

  it('Step 4: client_admin submits a slot request', async () => {
    mockRequestCompanySlots.mockResolvedValue({ ok: true, data: { requestId: 'req-123' } });

    setAuth(clientAdminProfile);
    renderCompanyOverview();

    await waitFor(() => expect(screen.getByText('Request More Slots')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Request More Slots'));

    await waitFor(() => expect(screen.getByText('Request Additional Slots')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /^submit request$/i }));

    await waitFor(() => {
      expect(mockRequestCompanySlots).toHaveBeenCalledWith(1);
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('Step 5: client_admin cancels the slot request', async () => {
    setupOverviewMock({
      totalUsers: 2,
      activeUsers: 2,
      pendingRequest: { id: 'req-123', requestedSlots: 5, status: 'pending' },
    });

    mockCancelSlotRequest.mockResolvedValue({ ok: true, data: undefined });

    setAuth(clientAdminProfile);
    renderCompanyOverview();

    await waitFor(() => expect(screen.getByText('Cancel Pending Request')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Cancel Pending Request'));

    await waitFor(() => expect(screen.getByText('Cancel Slot Request')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /^confirm cancellation$/i }));

    await waitFor(() => {
      expect(mockCancelSlotRequest).toHaveBeenCalledWith('req-123');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('Step 6: client_admin deactivates the client_user', async () => {
    const { getCompanyUsers } = await import('@/lib/db/admin-operations');
    vi.mocked(getCompanyUsers).mockResolvedValue([
      {
        userId: clientAdminProfile.user_id,
        fullName: 'Alice Admin',
        email: 'alice@example.com',
        role: 'client_admin',
        companyId: COMPANY_A_ID,
        companyName: 'Company A',
        isActive: true,
        createdAt: '2024-01-01',
        lastSignIn: null,
      },
      {
        userId: 'new-client-user',
        fullName: 'New Client User',
        email: 'new@example.com',
        role: 'client_user',
        companyId: COMPANY_A_ID,
        companyName: 'Company A',
        isActive: true,
        createdAt: '2024-01-02',
        lastSignIn: null,
      },
    ]);

    mockSetCompanyUserActive.mockResolvedValue({ ok: true, data: undefined });

    setAuth(clientAdminProfile);
    renderCompanyUsers();

    await waitFor(() => expect(screen.getByText('New Client User')).toBeInTheDocument());

    const deactivateBtn = screen.getAllByTitle('Deactivate user')[0];
    await userEvent.click(deactivateBtn);

    await waitFor(() => expect(screen.getByText(/deactivate user/i)).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /^deactivate$/i }));

    await waitFor(() => {
      expect(mockSetCompanyUserActive).toHaveBeenCalledWith('new-client-user', false);
    });
  });

  it('Step 7: client_admin reactivates the client_user', async () => {
    const { getCompanyUsers } = await import('@/lib/db/admin-operations');
    vi.mocked(getCompanyUsers).mockResolvedValue([
      {
        userId: clientAdminProfile.user_id,
        fullName: 'Alice Admin',
        email: 'alice@example.com',
        role: 'client_admin',
        companyId: COMPANY_A_ID,
        companyName: 'Company A',
        isActive: true,
        createdAt: '2024-01-01',
        lastSignIn: null,
      },
      {
        userId: 'new-client-user',
        fullName: 'New Client User',
        email: 'new@example.com',
        role: 'client_user',
        companyId: COMPANY_A_ID,
        companyName: 'Company A',
        isActive: false,
        createdAt: '2024-01-02',
        lastSignIn: null,
      },
    ]);

    mockSetCompanyUserActive.mockResolvedValue({ ok: true, data: undefined });

    setAuth(clientAdminProfile);
    renderCompanyUsers();

    await waitFor(() => expect(screen.getByText('New Client User')).toBeInTheDocument());

    const reactivateBtn = screen.getByTitle('Reactivate user');
    await userEvent.click(reactivateBtn);

    await waitFor(() => expect(screen.getByText(/reactivate user/i)).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /^reactivate$/i }));

    await waitFor(() => {
      expect(mockSetCompanyUserActive).toHaveBeenCalledWith('new-client-user', true);
    });
  });
});
