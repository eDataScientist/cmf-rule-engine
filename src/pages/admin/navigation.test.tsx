/**
 * M3-3.E.1 - Admin Navigation Integration Tests
 *
 * Covers navigation between admin sections (dashboard, companies, users, logs),
 * breadcrumb rendering per page, and quick-action button transitions from the
 * dashboard to target pages.
 *
 * Strategy: render each page in isolation with a MemoryRouter and assert that
 * the breadcrumb setter is called with the expected crumbs. For navigation
 * transitions, render the AdminDashboard and verify that quick-action buttons
 * call navigate() with the correct target path.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// --- Mocks ---

// Capture calls to useNavigate so we can assert route transitions.
const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
  Navigate: ({ to }: { to: string }) => {
    mockNavigate(to);
    return null;
  },
}));

// Capture breadcrumb setter calls per page.
const mockSetBreadcrumbs = vi.fn();

vi.mock('jotai', () => ({
  useSetAtom: () => mockSetBreadcrumbs,
}));

vi.mock('@/store/atoms/header', () => ({
  headerBreadcrumbsAtom: { __type: 'atom' },
}));

// Admin operations stubs — happy-path defaults; overridden per test when needed.
vi.mock('@/lib/db/admin-operations', () => ({
  getAdminDashboardCounts: vi.fn().mockResolvedValue({
    companies: 3,
    users: 12,
    datasets: 7,
    trees: 4,
  }),
  getRecentActivity: vi.fn().mockResolvedValue([]),
  getPendingSlotRequests: vi.fn().mockResolvedValue([]),
  getCompanies: vi.fn().mockResolvedValue([]),
  getAdminUsers: vi.fn().mockResolvedValue([]),
  getActivityLog: vi.fn().mockResolvedValue({ entries: [], total: 0 }),
  approveSlotRequest: vi.fn(),
  denySlotRequest: vi.fn(),
  toggleUserActive: vi.fn(),
}));

// Supabase stub (used by AdminUsers for register-user function invoke).
vi.mock('@/lib/db/supabase', () => ({
  supabase: {
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
    auth: { getUser: vi.fn() },
  },
}));

// Lazy imports resolved synchronously in test environment.
import AdminDashboard from './index';
import AdminCompanies from './companies/index';
import AdminUsers from './users/index';
import AdminLogs from './logs/index';

// --- Helpers ---

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard breadcrumb and quick-action navigation
// ─────────────────────────────────────────────────────────────────────────────

describe('M3-3.E.1 - Admin navigation integration', () => {
  describe('AdminDashboard breadcrumbs', () => {
    it('sets breadcrumbs to [Admin] on mount', async () => {
      render(<AdminDashboard />);

      await waitFor(() => {
        expect(mockSetBreadcrumbs).toHaveBeenCalledWith([
          { label: 'Admin', href: '/admin' },
        ]);
      });
    });

    it('clears breadcrumbs on unmount', async () => {
      const { unmount } = render(<AdminDashboard />);
      await waitFor(() => {
        expect(mockSetBreadcrumbs).toHaveBeenCalledWith([
          { label: 'Admin', href: '/admin' },
        ]);
      });

      mockSetBreadcrumbs.mockClear();
      unmount();

      expect(mockSetBreadcrumbs).toHaveBeenCalledWith([]);
    });
  });

  describe('AdminDashboard quick-action buttons navigate to correct routes', () => {
    it('"New Company" quick-action navigates to /admin/companies', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);

      await waitFor(() => {
        // Wait for loading to complete so buttons are rendered.
        expect(screen.getByRole('button', { name: /new company/i })).toBeDefined();
      });

      const newCompanyBtn = screen.getByRole('button', { name: /new company/i });
      await user.click(newCompanyBtn);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/companies');
    });

    it('"Register User" quick-action navigates to /admin/users', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /register user/i })).toBeDefined();
      });

      const registerBtn = screen.getByRole('button', { name: /register user/i });
      await user.click(registerBtn);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
    });
  });

  describe('AdminDashboard stat cards render with correct titles', () => {
    it('displays Companies, Users, Datasets, and Decision Trees stat cards', async () => {
      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Companies')).toBeDefined();
        expect(screen.getByText('Users')).toBeDefined();
        expect(screen.getByText('Datasets')).toBeDefined();
        expect(screen.getByText('Decision Trees')).toBeDefined();
      });
    });

    it('shows counts from useAdminDashboard in stat cards', async () => {
      render(<AdminDashboard />);

      await waitFor(() => {
        // Values from mock: companies=3, users=12, datasets=7, trees=4
        expect(screen.getByText('3')).toBeDefined();
        expect(screen.getByText('12')).toBeDefined();
        expect(screen.getByText('7')).toBeDefined();
        expect(screen.getByText('4')).toBeDefined();
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Companies page breadcrumbs
  // ─────────────────────────────────────────────────────────────────────────

  describe('AdminCompanies breadcrumbs', () => {
    it('sets two-level breadcrumbs [Admin > Companies] on mount', async () => {
      render(<AdminCompanies />);

      await waitFor(() => {
        expect(mockSetBreadcrumbs).toHaveBeenCalledWith([
          { label: 'Admin', href: '/admin' },
          { label: 'Companies', href: '/admin/companies' },
        ]);
      });
    });

    it('clears breadcrumbs on unmount', async () => {
      const { unmount } = render(<AdminCompanies />);
      await waitFor(() => {
        expect(mockSetBreadcrumbs).toHaveBeenCalledWith([
          { label: 'Admin', href: '/admin' },
          { label: 'Companies', href: '/admin/companies' },
        ]);
      });

      mockSetBreadcrumbs.mockClear();
      unmount();

      expect(mockSetBreadcrumbs).toHaveBeenCalledWith([]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Users page breadcrumbs
  // ─────────────────────────────────────────────────────────────────────────

  describe('AdminUsers breadcrumbs', () => {
    it('sets two-level breadcrumbs [Admin > Users] on mount', async () => {
      render(<AdminUsers />);

      await waitFor(() => {
        expect(mockSetBreadcrumbs).toHaveBeenCalledWith([
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
        ]);
      });
    });

    it('clears breadcrumbs on unmount', async () => {
      const { unmount } = render(<AdminUsers />);
      await waitFor(() => {
        expect(mockSetBreadcrumbs).toHaveBeenCalledWith([
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
        ]);
      });

      mockSetBreadcrumbs.mockClear();
      unmount();

      expect(mockSetBreadcrumbs).toHaveBeenCalledWith([]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Logs page breadcrumbs
  // ─────────────────────────────────────────────────────────────────────────

  describe('AdminLogs breadcrumbs', () => {
    it('sets two-level breadcrumbs [Admin > Activity Logs] on mount', async () => {
      render(<AdminLogs />);

      await waitFor(() => {
        expect(mockSetBreadcrumbs).toHaveBeenCalledWith([
          { label: 'Admin', href: '/admin' },
          { label: 'Activity Logs', href: '/admin/logs' },
        ]);
      });
    });

    it('clears breadcrumbs on unmount', async () => {
      const { unmount } = render(<AdminLogs />);
      await waitFor(() => {
        expect(mockSetBreadcrumbs).toHaveBeenCalledWith([
          { label: 'Admin', href: '/admin' },
          { label: 'Activity Logs', href: '/admin/logs' },
        ]);
      });

      mockSetBreadcrumbs.mockClear();
      unmount();

      expect(mockSetBreadcrumbs).toHaveBeenCalledWith([]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Page headings: each admin section renders its own page title
  // ─────────────────────────────────────────────────────────────────────────

  describe('Admin section page headings', () => {
    it('AdminDashboard renders "Admin Dashboard" heading', async () => {
      render(<AdminDashboard />);
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeDefined();
      });
    });

    it('AdminCompanies renders "Companies" heading', async () => {
      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText('Companies')).toBeDefined();
      });
    });

    it('AdminUsers renders "Users" heading', async () => {
      render(<AdminUsers />);
      await waitFor(() => {
        expect(screen.getByText('Users')).toBeDefined();
      });
    });

    it('AdminLogs renders "Activity Logs" heading', async () => {
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('Activity Logs')).toBeDefined();
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // PendingRequests slot-review approve/deny navigates (via onUpdate callback)
  // ─────────────────────────────────────────────────────────────────────────

  describe('AdminDashboard PendingRequests slot-review actions', () => {
    it('renders pending requests panel when pending slot requests exist', async () => {
      const { getAdminDashboardCounts, getRecentActivity, getPendingSlotRequests } =
        await import('@/lib/db/admin-operations');

      vi.mocked(getAdminDashboardCounts).mockResolvedValue({
        companies: 1,
        users: 2,
        datasets: 0,
        trees: 0,
      });
      vi.mocked(getRecentActivity).mockResolvedValue([]);
      vi.mocked(getPendingSlotRequests).mockResolvedValue([
        {
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
        },
      ]);

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Pending Slot Requests')).toBeDefined();
        expect(screen.getByText('Acme Corp')).toBeDefined();
      });
    });

    it('does not render pending requests panel when no pending requests exist', async () => {
      const { getAdminDashboardCounts, getRecentActivity, getPendingSlotRequests } =
        await import('@/lib/db/admin-operations');

      vi.mocked(getAdminDashboardCounts).mockResolvedValue({
        companies: 0,
        users: 0,
        datasets: 0,
        trees: 0,
      });
      vi.mocked(getRecentActivity).mockResolvedValue([]);
      vi.mocked(getPendingSlotRequests).mockResolvedValue([]);

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeDefined();
      });

      expect(screen.queryByText('Pending Slot Requests')).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // AdminDashboard error and retry state
  // ─────────────────────────────────────────────────────────────────────────

  describe('AdminDashboard error and retry', () => {
    it('shows retry button when dashboard data fails to load', async () => {
      const { getAdminDashboardCounts } = await import('@/lib/db/admin-operations');
      vi.mocked(getAdminDashboardCounts).mockRejectedValue(new Error('Network failure'));

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/retry/i)).toBeDefined();
      });
    });

    it('retry button triggers a fresh data load', async () => {
      const user = userEvent.setup();
      const { getAdminDashboardCounts, getRecentActivity, getPendingSlotRequests } =
        await import('@/lib/db/admin-operations');

      vi.mocked(getAdminDashboardCounts)
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValue({ companies: 2, users: 4, datasets: 1, trees: 0 });
      vi.mocked(getRecentActivity).mockResolvedValue([]);
      vi.mocked(getPendingSlotRequests).mockResolvedValue([]);

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/retry/i)).toBeDefined();
      });

      const retryBtn = screen.getByRole('button', { name: /retry/i });
      await user.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeDefined();
        expect(getAdminDashboardCounts).toHaveBeenCalledTimes(2);
      });
    });
  });
});
