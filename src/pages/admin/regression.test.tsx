/**
 * M3-3.E.2 - Admin Console Regression Tests
 *
 * Covers known failure patterns observed during review:
 *   1. Deactivated-account handling -- RoleGuard signs out and redirects
 *   2. Unauthorized-role handling -- non-admin profiles redirected away from /admin
 *   3. Slot-review refresh -- approve/deny refresh the dashboard list
 *   4. Admin dialog lifecycle -- dialogs reset state on close/reopen, disable
 *      submit while processing, and do not get stuck open on error
 *
 * RoleGuard tests use a MemoryRouter + real RoleGuard component with mocked auth
 * context. Dialog tests render the dialog components in isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Hoisted mock state ───────────────────────────────────────────────────────

const mockNavigate = vi.fn();
let mockAuthState: {
  user: object | null;
  profile: { role: string; is_active: boolean; company_id: string | null; full_name: string | null; user_id: string } | null;
  loading: boolean;
  signOut: ReturnType<typeof vi.fn>;
  session: null;
  signIn: ReturnType<typeof vi.fn>;
  signInWithOtp: ReturnType<typeof vi.fn>;
  verifyOtp: ReturnType<typeof vi.fn>;
} = {
  user: { id: 'admin-uid' },
  profile: { user_id: 'admin-uid', role: 'admin', is_active: true, company_id: null, full_name: 'Admin' },
  loading: false,
  signOut: vi.fn(),
  session: null,
  signIn: vi.fn(),
  signInWithOtp: vi.fn(),
  verifyOtp: vi.fn(),
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/admin' }),
  Navigate: ({ to }: { to: string }) => {
    mockNavigate(to);
    return null;
  },
}));

vi.mock('@/lib/auth/context', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('jotai', () => ({
  useSetAtom: () => vi.fn(),
}));

vi.mock('@/store/atoms/header', () => ({
  headerBreadcrumbsAtom: { __type: 'atom' },
}));

vi.mock('@/lib/db/admin-operations', () => ({
  getAdminDashboardCounts: vi.fn().mockResolvedValue({
    companies: 1,
    users: 2,
    datasets: 0,
    trees: 0,
  }),
  getRecentActivity: vi.fn().mockResolvedValue([]),
  getPendingSlotRequests: vi.fn().mockResolvedValue([]),
  getCompanies: vi.fn().mockResolvedValue([]),
  getAdminUsers: vi.fn().mockResolvedValue([]),
  getActivityLog: vi.fn().mockResolvedValue({ entries: [], total: 0 }),
  approveSlotRequest: vi.fn().mockResolvedValue(undefined),
  denySlotRequest: vi.fn().mockResolvedValue(undefined),
  toggleUserActive: vi.fn().mockResolvedValue(undefined),
  createCompany: vi.fn().mockResolvedValue(undefined),
  updateCompany: vi.fn().mockResolvedValue(undefined),
  deactivateCompany: vi.fn().mockResolvedValue(undefined),
  reactivateCompany: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/db/supabase', () => ({
  supabase: {
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
    auth: { getUser: vi.fn() },
  },
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { RoleGuard } from '@/components/shared/RoleGuard';
import AdminDashboard from './index';
import { PendingRequests } from './components/PendingRequests';
import { CreateCompanyDialog } from './companies/components/CreateCompanyDialog';
import { RegisterUserDialog } from './users/components/RegisterUserDialog';
import type { SlotRequest, Company } from '@/lib/db/admin-operations';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeSlotRequest = (overrides: Partial<SlotRequest> = {}): SlotRequest => ({
  id: 'req-1',
  companyId: 'co-1',
  companyName: 'Acme Corp',
  requestedBy: 'user-1',
  requestedByName: 'John Doe',
  requestedSlots: 5,
  status: 'pending',
  reviewedBy: null,
  createdAt: '2026-05-15T08:00:00Z',
  updatedAt: '2026-05-15T08:00:00Z',
  ...overrides,
});

const activeCompany: Company = {
  id: 'co-1',
  name: 'Acme Corp',
  country: 'UAE',
  insuranceType: 'motor',
  maxUserSlots: 10,
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  createdBy: 'admin-uid',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  // Reset to healthy admin state before each test.
  mockAuthState = {
    user: { id: 'admin-uid' },
    profile: { user_id: 'admin-uid', role: 'admin', is_active: true, company_id: null, full_name: 'Admin' },
    loading: false,
    signOut: vi.fn(),
    session: null,
    signIn: vi.fn(),
    signInWithOtp: vi.fn(),
    verifyOtp: vi.fn(),
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. DEACTIVATED ACCOUNT REGRESSION
// ─────────────────────────────────────────────────────────────────────────────

describe('M3-3.E.2 - Admin regression scenarios', () => {
  describe('Deactivated account handling (RoleGuard)', () => {
    it('redirects to /auth when user exists but profile is null (unprovisioned)', () => {
      mockAuthState = { ...mockAuthState, user: { id: 'ghost-uid' }, profile: null };

      render(
        <RoleGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/auth');
      expect(screen.queryByText('Admin Content')).toBeNull();
    });

    it('redirects to /auth with deactivation message when profile.is_active is false', () => {
      mockAuthState = {
        ...mockAuthState,
        user: { id: 'deactivated-uid' },
        profile: {
          user_id: 'deactivated-uid',
          role: 'client_admin',
          is_active: false,
          company_id: 'co-1',
          full_name: 'Deactivated User',
        },
      };

      render(
        <RoleGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/auth');
      expect(screen.queryByText('Admin Content')).toBeNull();
    });

    it('calls signOut when account is deactivated', async () => {
      const signOutMock = vi.fn();
      mockAuthState = {
        ...mockAuthState,
        user: { id: 'deactivated-uid' },
        profile: {
          user_id: 'deactivated-uid',
          role: 'client_user',
          is_active: false,
          company_id: 'co-1',
          full_name: null,
        },
        signOut: signOutMock,
      };

      render(
        <RoleGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      await waitFor(() => {
        expect(signOutMock).toHaveBeenCalledOnce();
      });
    });

    it('does not call signOut more than once for a deactivated account', async () => {
      const signOutMock = vi.fn();
      mockAuthState = {
        ...mockAuthState,
        user: { id: 'deactivated-uid' },
        profile: { user_id: 'deactivated-uid', role: 'client_user', is_active: false, company_id: null, full_name: null },
        signOut: signOutMock,
      };

      const { rerender } = render(
        <RoleGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      // Force a re-render to verify the guard does not double-trigger signOut.
      rerender(
        <RoleGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      await waitFor(() => {
        expect(signOutMock).toHaveBeenCalledOnce();
      });
    });

    it('renders children when user is authenticated and profile is active', () => {
      render(
        <RoleGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Admin Content')).toBeDefined();
      expect(mockNavigate).not.toHaveBeenCalledWith('/auth');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. UNAUTHORIZED ROLE REGRESSION
  // ───────────────────────────────────────────────────────────────────────────

  describe('Unauthorized role handling (RoleGuard)', () => {
    it('redirects client_admin away from admin-only routes', () => {
      mockAuthState = {
        ...mockAuthState,
        profile: {
          user_id: 'client-admin-uid',
          role: 'client_admin',
          is_active: true,
          company_id: 'co-1',
          full_name: 'Client Admin',
        },
      };

      render(
        <RoleGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      // client_admin landing path is /datasets
      expect(mockNavigate).toHaveBeenCalledWith('/datasets');
      expect(screen.queryByText('Admin Content')).toBeNull();
    });

    it('redirects client_user away from admin-only routes', () => {
      mockAuthState = {
        ...mockAuthState,
        profile: {
          user_id: 'client-user-uid',
          role: 'client_user',
          is_active: true,
          company_id: 'co-1',
          full_name: 'Client User',
        },
      };

      render(
        <RoleGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/datasets');
      expect(screen.queryByText('Admin Content')).toBeNull();
    });

    it('redirects unauthenticated user to /auth', () => {
      mockAuthState = { ...mockAuthState, user: null, profile: null };

      render(
        <RoleGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });

    it('renders loading spinner while auth is resolving', () => {
      mockAuthState = { ...mockAuthState, loading: true };

      render(
        <RoleGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      // Loading state: no children rendered, no navigation.
      expect(screen.queryByText('Admin Content')).toBeNull();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('allows admin role through admin-only guard', () => {
      render(
        <RoleGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Admin Content')).toBeDefined();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 3. SLOT-REVIEW REFRESH REGRESSION
  // ───────────────────────────────────────────────────────────────────────────

  describe('Slot-review refresh after approve/deny (PendingRequests)', () => {
    it('calls onUpdate after a successful approve action', async () => {
      const { approveSlotRequest } = await import('@/lib/db/admin-operations');
      vi.mocked(approveSlotRequest).mockResolvedValue(undefined);

      const user = userEvent.setup();
      const onUpdate = vi.fn();
      const requests = [makeSlotRequest({ id: 'req-1' })];

      render(<PendingRequests requests={requests} onUpdate={onUpdate} />);

      const approveBtn = screen.getByTitle('Approve');
      await user.click(approveBtn);

      await waitFor(() => {
        expect(approveSlotRequest).toHaveBeenCalledWith('req-1');
        expect(onUpdate).toHaveBeenCalledOnce();
      });
    });

    it('calls onUpdate after a successful deny action', async () => {
      const { denySlotRequest } = await import('@/lib/db/admin-operations');
      vi.mocked(denySlotRequest).mockResolvedValue(undefined);

      const user = userEvent.setup();
      const onUpdate = vi.fn();
      const requests = [makeSlotRequest({ id: 'req-2' })];

      render(<PendingRequests requests={requests} onUpdate={onUpdate} />);

      const denyBtn = screen.getByTitle('Deny');
      await user.click(denyBtn);

      await waitFor(() => {
        expect(denySlotRequest).toHaveBeenCalledWith('req-2');
        expect(onUpdate).toHaveBeenCalledOnce();
      });
    });

    it('disables both buttons while a request is being processed', async () => {
      const { approveSlotRequest } = await import('@/lib/db/admin-operations');
      // Keep the promise pending so the processing state persists.
      let resolveApprove!: () => void;
      vi.mocked(approveSlotRequest).mockReturnValue(
        new Promise<void>((res) => { resolveApprove = res; })
      );

      const user = userEvent.setup();
      const requests = [makeSlotRequest({ id: 'req-1' })];

      render(<PendingRequests requests={requests} onUpdate={vi.fn()} />);

      const approveBtn = screen.getByTitle('Approve');
      const denyBtn = screen.getByTitle('Deny');

      await user.click(approveBtn);

      // While processing, both buttons on that item should be disabled.
      expect(approveBtn).toHaveAttribute('disabled');
      expect(denyBtn).toHaveAttribute('disabled');

      // Resolve so the test does not leak an unresolved promise.
      resolveApprove();
    });

    it('does not call onUpdate when approve fails', async () => {
      const { approveSlotRequest } = await import('@/lib/db/admin-operations');
      vi.mocked(approveSlotRequest).mockRejectedValue(new Error('RPC error'));

      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      const requests = [makeSlotRequest()];

      render(<PendingRequests requests={requests} onUpdate={onUpdate} />);

      const approveBtn = screen.getByTitle('Approve');
      await user.click(approveBtn);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      expect(onUpdate).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('re-enables buttons after approve failure', async () => {
      const { approveSlotRequest } = await import('@/lib/db/admin-operations');
      vi.mocked(approveSlotRequest).mockRejectedValue(new Error('Fail'));

      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();
      const requests = [makeSlotRequest()];

      render(<PendingRequests requests={requests} onUpdate={vi.fn()} />);

      const approveBtn = screen.getByTitle('Approve');
      await user.click(approveBtn);

      await waitFor(() => {
        expect(approveBtn).not.toHaveAttribute('disabled');
      });

      consoleError.mockRestore();
    });

    it('dashboard refresh (onUpdate) triggers a data reload via useAdminDashboard', async () => {
      const { getAdminDashboardCounts, getRecentActivity, getPendingSlotRequests, approveSlotRequest } =
        await import('@/lib/db/admin-operations');

      vi.mocked(approveSlotRequest).mockResolvedValue(undefined);
      const pendingRequest = makeSlotRequest({ id: 'req-refresh' });

      vi.mocked(getPendingSlotRequests)
        .mockResolvedValueOnce([pendingRequest]) // initial load
        .mockResolvedValueOnce([]);              // after refresh
      vi.mocked(getAdminDashboardCounts).mockResolvedValue({ companies: 1, users: 1, datasets: 0, trees: 0 });
      vi.mocked(getRecentActivity).mockResolvedValue([]);

      const user = userEvent.setup();
      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeDefined();
      });

      const approveBtn = screen.getByTitle('Approve');
      await user.click(approveBtn);

      await waitFor(() => {
        // After refresh the pending request panel should disappear (no requests).
        expect(screen.queryByText('Pending Slot Requests')).toBeNull();
        expect(getPendingSlotRequests).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 4. ADMIN DIALOG LIFECYCLE REGRESSION
  // ───────────────────────────────────────────────────────────────────────────

  describe('Admin dialog lifecycle (CreateCompanyDialog)', () => {
    it('does not render when open=false', () => {
      render(
        <CreateCompanyDialog
          open={false}
          onOpenChange={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      expect(screen.queryByText('Create Company')).toBeNull();
    });

    it('renders form when open=true', () => {
      render(
        <CreateCompanyDialog
          open={true}
          onOpenChange={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      expect(screen.getByText('Create Company')).toBeDefined();
    });

    it('calls onOpenChange(false) on Cancel click', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <CreateCompanyDialog
          open={true}
          onOpenChange={onOpenChange}
          onSubmit={vi.fn()}
        />
      );

      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelBtn);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('shows validation error when submitted with empty name', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <CreateCompanyDialog
          open={true}
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
        />
      );

      const createBtn = screen.getByRole('button', { name: /create/i });
      await user.click(createBtn);

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/all fields are required/i)).toBeDefined();
    });

    it('disables submit button while processing', async () => {
      const user = userEvent.setup();
      let resolveSubmit!: () => void;
      const onSubmit = vi.fn().mockReturnValue(
        new Promise<void>((res) => { resolveSubmit = res; })
      );

      render(
        <CreateCompanyDialog
          open={true}
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
        />
      );

      const nameInput = screen.getByPlaceholderText(/acme insurance/i);
      const countryInput = screen.getByPlaceholderText(/uae/i);
      await user.type(nameInput, 'Test Corp');
      await user.type(countryInput, 'UAE');

      const createBtn = screen.getByRole('button', { name: /create/i });
      await user.click(createBtn);

      expect(createBtn).toHaveAttribute('disabled');

      resolveSubmit();
    });

    it('shows error message when onSubmit rejects', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockRejectedValue(new Error('Duplicate name'));

      render(
        <CreateCompanyDialog
          open={true}
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
        />
      );

      const nameInput = screen.getByPlaceholderText(/acme insurance/i);
      const countryInput = screen.getByPlaceholderText(/uae/i);
      await user.type(nameInput, 'Test Corp');
      await user.type(countryInput, 'UAE');

      const createBtn = screen.getByRole('button', { name: /create/i });
      await user.click(createBtn);

      await waitFor(() => {
        expect(screen.getByText(/duplicate name/i)).toBeDefined();
      });
    });

    it('does not close dialog on submission failure (stays open for correction)', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'));

      render(
        <CreateCompanyDialog
          open={true}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      );

      const nameInput = screen.getByPlaceholderText(/acme insurance/i);
      const countryInput = screen.getByPlaceholderText(/uae/i);
      await user.type(nameInput, 'Test Corp');
      await user.type(countryInput, 'UAE');

      const createBtn = screen.getByRole('button', { name: /create/i });
      await user.click(createBtn);

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeDefined();
      });

      // onOpenChange(false) should NOT be called -- dialog stays open.
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 5. REGISTER USER DIALOG LIFECYCLE REGRESSION
  // ───────────────────────────────────────────────────────────────────────────

  describe('Admin dialog lifecycle (RegisterUserDialog)', () => {
    it('only shows active companies in the company selector', () => {
      const companies: Company[] = [
        { ...activeCompany, id: 'co-1', name: 'Active Corp', isActive: true },
        { ...activeCompany, id: 'co-2', name: 'Inactive Corp', isActive: false },
      ];

      render(
        <RegisterUserDialog
          open={true}
          onOpenChange={vi.fn()}
          companies={companies}
          onSubmit={vi.fn()}
        />
      );

      expect(screen.getByText('Active Corp')).toBeDefined();
      expect(screen.queryByText('Inactive Corp')).toBeNull();
    });

    it('shows validation error when company is not selected', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <RegisterUserDialog
          open={true}
          onOpenChange={vi.fn()}
          companies={[activeCompany]}
          onSubmit={onSubmit}
        />
      );

      const emailInput = screen.getByPlaceholderText(/user@company.com/i);
      const nameInput = screen.getByPlaceholderText(/john doe/i);
      await user.type(emailInput, 'test@example.com');
      await user.type(nameInput, 'Test User');
      // company not selected

      const registerBtn = screen.getByRole('button', { name: /register/i });
      await user.click(registerBtn);

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/all fields are required/i)).toBeDefined();
    });

    it('calls onOpenChange(false) when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <RegisterUserDialog
          open={true}
          onOpenChange={onOpenChange}
          companies={[activeCompany]}
          onSubmit={vi.fn()}
        />
      );

      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelBtn);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('disables Register button while submitting', async () => {
      const user = userEvent.setup();
      let resolveSubmit!: () => void;
      const onSubmit = vi.fn().mockReturnValue(
        new Promise<void>((res) => { resolveSubmit = res; })
      );

      const companies: Company[] = [activeCompany];

      render(
        <RegisterUserDialog
          open={true}
          onOpenChange={vi.fn()}
          companies={companies}
          onSubmit={onSubmit}
        />
      );

      const emailInput = screen.getByPlaceholderText(/user@company.com/i);
      const nameInput = screen.getByPlaceholderText(/john doe/i);
      const companySelect = screen.getByRole('combobox', { name: /company/i });

      await user.type(emailInput, 'test@acme.com');
      await user.type(nameInput, 'Test User');
      await user.selectOptions(companySelect, 'co-1');

      const registerBtn = screen.getByRole('button', { name: /register/i });
      await user.click(registerBtn);

      expect(registerBtn).toHaveAttribute('disabled');

      resolveSubmit();
    });

    it('shows error message from submission failure', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockRejectedValue(new Error('Slot capacity reached'));

      const companies: Company[] = [activeCompany];

      render(
        <RegisterUserDialog
          open={true}
          onOpenChange={vi.fn()}
          companies={companies}
          onSubmit={onSubmit}
        />
      );

      const emailInput = screen.getByPlaceholderText(/user@company.com/i);
      const nameInput = screen.getByPlaceholderText(/john doe/i);
      const companySelect = screen.getByRole('combobox', { name: /company/i });

      await user.type(emailInput, 'test@acme.com');
      await user.type(nameInput, 'Test User');
      await user.selectOptions(companySelect, 'co-1');

      const registerBtn = screen.getByRole('button', { name: /register/i });
      await user.click(registerBtn);

      await waitFor(() => {
        expect(screen.getByText(/slot capacity reached/i)).toBeDefined();
      });
    });

    it('does not close dialog when registration fails', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onSubmit = vi.fn().mockRejectedValue(new Error('Edge function error'));

      const companies: Company[] = [activeCompany];

      render(
        <RegisterUserDialog
          open={true}
          onOpenChange={onOpenChange}
          companies={companies}
          onSubmit={onSubmit}
        />
      );

      const emailInput = screen.getByPlaceholderText(/user@company.com/i);
      const nameInput = screen.getByPlaceholderText(/john doe/i);
      const companySelect = screen.getByRole('combobox', { name: /company/i });

      await user.type(emailInput, 'test@acme.com');
      await user.type(nameInput, 'Test User');
      await user.selectOptions(companySelect, 'co-1');

      const registerBtn = screen.getByRole('button', { name: /register/i });
      await user.click(registerBtn);

      await waitFor(() => {
        expect(screen.getByText(/edge function error/i)).toBeDefined();
      });

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });
  });
});
