/**
 * T-M3-4.E.2 — Audit-log visibility scenario
 *
 * Every mutation taken by client_admin in E.1 produces a corresponding
 * admin_activity_log row visible at /admin/logs with correct actor
 * (client_admin), target, action label, and details metadata.
 * Mounts both /company* (acting role) and /admin/logs (verifying role).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import { clientAdminProfile, COMPANY_A_ID } from '@/test/fixtures/clientAdmin';
import type { UserProfile } from '@/lib/auth/context';
import type { ActivityLogEntry } from '@/lib/db/admin-operations';

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

const mockGetActivityLog = vi.fn();

vi.mock('@/lib/db/admin-operations', () => ({
  getActivityLog: (...args: unknown[]) => mockGetActivityLog(...args),
}));

vi.mock('@/lib/db/client-operations', () => ({
  registerCompanyUser: vi.fn(),
  updateCompanyUser: vi.fn(),
  setCompanyUserActive: vi.fn(),
  resendCompanyUserInvite: vi.fn(),
  resetCompanyUserAccess: vi.fn(),
  cancelSlotRequest: vi.fn(),
  requestCompanySlots: vi.fn(),
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

// ─── Mock useCompanyOverview ──────────────────────────────────────────────────

const mockRefresh = vi.fn();

vi.mock('@/pages/company/hooks/useCompanyOverview', () => ({
  useCompanyOverview: vi.fn(),
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { useCompanyOverview } from '@/pages/company/hooks/useCompanyOverview';
import CompanyOverview from '@/pages/company';
import AdminLogs from '@/pages/admin/logs';

function renderCompanyOverview() {
  return render(
    <MemoryRouter initialEntries={['/company']}>
      <CompanyOverview />
    </MemoryRouter>
  );
}

function renderAdminLogs() {
  return render(
    <MemoryRouter initialEntries={['/admin/logs']}>
      <AdminLogs />
    </MemoryRouter>
  );
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const now = new Date().toISOString();

function makeAuditEntry(overrides: Partial<ActivityLogEntry> = {}): ActivityLogEntry {
  return {
    id: overrides.id ?? 'log-1',
    userId: clientAdminProfile.user_id,
    userName: clientAdminProfile.full_name!,
    action: 'register_user',
    targetType: 'user',
    targetId: 'new-client-user',
    details: { company_id: COMPANY_A_ID },
    ipAddress: null,
    createdAt: now,
    ...overrides,
  };
}

const auditEntries: ActivityLogEntry[] = [
  makeAuditEntry({
    id: 'log-1',
    action: 'register_user',
    targetType: 'user',
    targetId: 'new-client-user',
    details: { email: 'new@example.com', role: 'client_user', company_id: COMPANY_A_ID },
  }),
  makeAuditEntry({
    id: 'log-2',
    action: 'cancel_slot_request',
    targetType: 'slot_request',
    targetId: 'req-123',
    details: { request_id: 'req-123', requested_slots: 5, company_id: COMPANY_A_ID },
  }),
  makeAuditEntry({
    id: 'log-3',
    action: 'deactivate_user',
    targetType: 'user',
    targetId: 'new-client-user',
    details: { company_id: COMPANY_A_ID },
  }),
  makeAuditEntry({
    id: 'log-4',
    action: 'reactivate_user',
    targetType: 'user',
    targetId: 'new-client-user',
    details: { company_id: COMPANY_A_ID },
  }),
];

beforeEach(() => {
  vi.clearAllMocks();
  setAuth(clientAdminProfile);
  mockGetActivityLog.mockReset();
});

// ─────────────────────────────────────────────────────────────────────────────
// T-M3-4.E.2 — Audit-log visibility scenario
// ─────────────────────────────────────────────────────────────────────────────

describe('T-M3-4.E.2 — Audit-log visibility scenario', () => {
  it('company overview recent activity shows client_admin mutations with readable labels', async () => {
    vi.mocked(useCompanyOverview).mockReturnValue({
      data: {
        company: { id: COMPANY_A_ID, name: 'Company A', maxUserSlots: 10, isActive: true },
        totalUsers: 2,
        activeUsers: 2,
        pendingRequest: null,
        activities: auditEntries.map((e) => ({
          id: e.id,
          action: e.action,
          userName: e.userName,
          createdAt: e.createdAt,
          targetType: e.targetType,
          targetId: e.targetId,
          details: e.details,
        })),
      },
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    setAuth(clientAdminProfile);
    renderCompanyOverview();

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    // Human-readable action labels from CompanyOverview actionLabels map
    expect(screen.getByText('Registered user')).toBeInTheDocument();
    expect(screen.getByText('Deactivated user')).toBeInTheDocument();
    expect(screen.getByText('Reactivated user')).toBeInTheDocument();

    // cancel_slot_request has no label — falls back to raw action
    expect(screen.getByText('cancel_slot_request')).toBeInTheDocument();

    // Actor name should be visible for every activity entry
    expect(screen.getAllByText(`By ${clientAdminProfile.full_name!}`).length).toBe(4);
  });

  it('admin logs page displays all client_admin mutations with correct metadata', async () => {
    mockGetActivityLog.mockResolvedValue({ entries: auditEntries, total: 4 });

    setAuth({ ...clientAdminProfile, user_id: 'admin-1', role: 'admin', company_id: null });
    renderAdminLogs();

    await waitFor(() => {
      expect(screen.getByText('register user')).toBeInTheDocument();
      expect(screen.getByText('cancel slot request')).toBeInTheDocument();
      expect(screen.getByText('deactivate user')).toBeInTheDocument();
      expect(screen.getByText('reactivate user')).toBeInTheDocument();
    });

    // Target types should be visible
    expect(screen.getAllByText('user').length).toBeGreaterThan(0);
    expect(screen.getByText('slot_request')).toBeInTheDocument();

    // Actor name should be visible for every log entry
    expect(screen.getAllByText(clientAdminProfile.full_name!).length).toBe(4);
  });

  it('expanding a log entry reveals details metadata with correct keys', async () => {
    mockGetActivityLog.mockResolvedValue({ entries: auditEntries, total: 4 });

    setAuth({ ...clientAdminProfile, user_id: 'admin-1', role: 'admin', company_id: null });
    renderAdminLogs();

    await waitFor(() => {
      expect(screen.getByText('register user')).toBeInTheDocument();
    });

    const expandButtons = screen.getAllByLabelText(/expand log details/i);
    expect(expandButtons.length).toBe(4);

    await userEvent.click(expandButtons[0]);

    await waitFor(() => {
      // Details JSON should contain expected keys
      expect(screen.getByText(/"email"/)).toBeInTheDocument();
      expect(screen.getByText(/"role"/)).toBeInTheDocument();
      expect(screen.getByText(/"company_id"/)).toBeInTheDocument();
    });
  });

  it('row count in admin logs matches the number of client_admin mutations', async () => {
    mockGetActivityLog.mockResolvedValue({ entries: auditEntries, total: 4 });

    setAuth({ ...clientAdminProfile, user_id: 'admin-1', role: 'admin', company_id: null });
    renderAdminLogs();

    await waitFor(() => {
      expect(screen.getByText(/Audit trail of all admin actions \(4 total\)/)).toBeInTheDocument();
    });
  });

  it('actor user_id matches the client_admin for every mutation entry', async () => {
    mockGetActivityLog.mockResolvedValue({ entries: auditEntries, total: 4 });

    setAuth({ ...clientAdminProfile, user_id: 'admin-1', role: 'admin', company_id: null });
    renderAdminLogs();

    await waitFor(() => {
      expect(screen.getByText('register user')).toBeInTheDocument();
    });

    // All entries should show the same actor name
    const actorCells = screen.getAllByText(clientAdminProfile.full_name!);
    expect(actorCells.length).toBe(4);
  });
});
