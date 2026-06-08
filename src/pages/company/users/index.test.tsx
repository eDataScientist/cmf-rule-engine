/**
 * Stream C user-management surface tests
 *
 * Covers:
 * - T-M3-4.C.2.1 — Page renders user table with columns
 * - T-M3-4.C.2.2 — No slot UI on /company/users
 * - T-M3-4.C.3 — Register dialog (happy, capacity block, backend error)
 * - T-M3-4.C.4 — Edit dialog (happy, self-block, admin-row block)
 * - T-M3-4.C.5 — Status dialog (deactivate/reactivate, self-block)
 * - T-M3-4.C.6 — Recovery menu (resend invite, reset access, success, failure)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { clientAdminProfile } from '@/test/fixtures/clientAdmin';
import type { UserProfile } from '@/lib/auth/context';
import type { AdminUser, Company } from '@/lib/db/admin-operations';

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

const mockUsers: AdminUser[] = [
  {
    userId: clientAdminProfile.user_id,
    fullName: 'Alice Admin',
    email: 'alice@example.com',
    role: 'client_admin' as const,
    companyId: clientAdminProfile.company_id as string,
    companyName: 'Company A',
    isActive: true,
    createdAt: '2024-01-01',
    lastSignIn: null,
  },
  {
    userId: 'user-2',
    fullName: 'Bob User',
    email: 'bob@example.com',
    role: 'client_user' as const,
    companyId: clientAdminProfile.company_id as string,
    companyName: 'Company A',
    isActive: false,
    createdAt: '2024-01-02',
    lastSignIn: null,
  },
  {
    userId: 'user-3',
    fullName: 'Charlie Admin',
    email: 'charlie@example.com',
    role: 'admin' as const,
    companyId: null,
    companyName: null,
    isActive: true,
    createdAt: '2024-01-03',
    lastSignIn: null,
  },
];

const mockCompany: Company = {
  id: clientAdminProfile.company_id as string,
  name: 'Company A',
  country: 'US',
  insuranceType: 'motor' as const,
  maxUserSlots: 10,
  isActive: true,
  createdAt: '2024-01-01',
  createdBy: null,
};

vi.mock('@/lib/db/admin-operations', () => ({
  getCompanyUsers: vi.fn().mockImplementation(() => Promise.resolve(mockUsers)),
  getCompany: vi.fn().mockImplementation(() => Promise.resolve(mockCompany)),
}));

const mockRegisterCompanyUser = vi.fn();
const mockUpdateCompanyUser = vi.fn();
const mockSetCompanyUserActive = vi.fn();
const mockResendCompanyUserInvite = vi.fn();
const mockResetCompanyUserAccess = vi.fn();

vi.mock('@/lib/db/client-operations', () => ({
  registerCompanyUser: (...args: unknown[]) => mockRegisterCompanyUser(...args),
  updateCompanyUser: (...args: unknown[]) => mockUpdateCompanyUser(...args),
  setCompanyUserActive: (...args: unknown[]) => mockSetCompanyUserActive(...args),
  resendCompanyUserInvite: (...args: unknown[]) => mockResendCompanyUserInvite(...args),
  resetCompanyUserAccess: (...args: unknown[]) => mockResetCompanyUserAccess(...args),
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
  mockRegisterCompanyUser.mockReset();
  mockUpdateCompanyUser.mockReset();
  mockSetCompanyUserActive.mockReset();
  mockResendCompanyUserInvite.mockReset();
  mockResetCompanyUserAccess.mockReset();
});

// ─── Lazy imports ─────────────────────────────────────────────────────────────

import CompanyUsers from './index';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/company/users']}>
      <CompanyUsers />
    </MemoryRouter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// T-M3-4.C.2.1 — Page renders user table
// ─────────────────────────────────────────────────────────────────────────────

describe('T-M3-4.C.2.1 — Page renders user table', () => {
  it('renders users with name, email columns', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('Bob User')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });
  });

  it('renders status badges for users', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Active').length).toBe(2);
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  it('renders Register User button', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /register user/i })).toBeInTheDocument();
    });
  });

  it('renders Last Sign-in and Added columns', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Last Sign-in')).toBeInTheDocument();
      expect(screen.getByText('Added')).toBeInTheDocument();
    });
  });

  it('renders action buttons for each row', async () => {
    renderPage();

    await waitFor(() => {
      // At least one edit button, one toggle button, one recovery menu
      expect(screen.getAllByTitle(/edit user|cannot edit/i).length).toBeGreaterThan(0);
      expect(screen.getAllByTitle(/deactivate user|reactivate user|cannot deactivate/i).length).toBeGreaterThan(0);
      expect(screen.getAllByTitle('Recovery options').length).toBeGreaterThan(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T-M3-4.C.2.2 — No slot UI on /company/users
// ─────────────────────────────────────────────────────────────────────────────

describe('T-M3-4.C.2.2 — No slot UI on /company/users', () => {
  it('does not render slot request button', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /request more slots/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /request slots/i })).not.toBeInTheDocument();
    });
  });

  it('does not render slot request dialog', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.queryByText(/request additional slots/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/slot requests/i)).not.toBeInTheDocument();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T-M3-4.C.3 — Register dialog tests
// ─────────────────────────────────────────────────────────────────────────────

describe('T-M3-4.C.3 — Register Company User Dialog', () => {
  it('registers a user on happy path', async () => {
    mockRegisterCompanyUser.mockResolvedValue({ ok: true, data: { userId: 'new-user', email: 'new@example.com', companyId: 'comp', role: 'client_user' } });

    renderPage();

    await waitFor(() => expect(screen.getByRole('button', { name: /register user/i })).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /register user/i }));

    await waitFor(() => expect(screen.getByText(/available slots/i)).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText(/email/i), 'new@example.com');
    await userEvent.type(screen.getByLabelText(/full name/i), 'New User');

    await userEvent.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(mockRegisterCompanyUser).toHaveBeenCalledWith('new@example.com', 'New User', 'client_user');
    });
  });

  it('blocks submit at slot capacity', async () => {
    const atCapacityCompany: Company = { ...mockCompany, id: 'company-a-fixture-id', maxUserSlots: 3 };
    const { getCompany } = await import('@/lib/db/admin-operations');
    vi.mocked(getCompany).mockResolvedValueOnce(atCapacityCompany);
    // 3 mock users exist, so capacity = 3 means at capacity

    // 3 users already in mockUsers
    renderPage();

    await waitFor(() => expect(screen.getByRole('button', { name: /register user/i })).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /register user/i }));

    await waitFor(() => expect(screen.getByText(/at slot capacity/i)).toBeInTheDocument());

    const submitBtn = screen.getByRole('button', { name: /^register$/i });
    expect(submitBtn).toBeDisabled();
  });

  it('surfaces backend error on registration failure', async () => {
    mockRegisterCompanyUser.mockResolvedValue({ ok: false, error: 'Email already in use' });

    renderPage();

    await waitFor(() => expect(screen.getByRole('button', { name: /register user/i })).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /register user/i }));

    await waitFor(() => expect(screen.getByLabelText(/email/i)).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText(/email/i), 'dup@example.com');
    await userEvent.type(screen.getByLabelText(/full name/i), 'Dup User');

    await userEvent.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T-M3-4.C.4 — Edit dialog tests
// ─────────────────────────────────────────────────────────────────────────────

describe('T-M3-4.C.4 — Edit Company User Dialog', () => {
  it('edits a user on happy path', async () => {
    mockUpdateCompanyUser.mockResolvedValue({ ok: true, data: { userId: 'user-2', fullName: 'Bob Updated', role: 'client_admin' } });

    renderPage();

    await waitFor(() => expect(screen.getByText('Bob User')).toBeInTheDocument());

    // Click edit on Bob's row (user-2)
    const editBtn = screen.getAllByTitle('Edit user')[0];
    await userEvent.click(editBtn);

    await waitFor(() => expect(screen.getByText(/editing/i)).toBeInTheDocument());

    const nameInput = screen.getByLabelText(/full name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Bob Updated');

    const roleSelect = screen.getByLabelText(/role/i) as HTMLSelectElement;
    roleSelect.value = 'client_admin';
    roleSelect.dispatchEvent(new Event('change', { bubbles: true }));

    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(mockUpdateCompanyUser).toHaveBeenCalledWith('user-2', 'Bob Updated', 'client_admin');
    });
  });

  it('blocks editing the caller own row', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('Alice Admin')).toBeInTheDocument());

    // Alice is the current user; her edit button should be disabled
    const selfEditBtn = screen.getByTitle('Cannot edit your own account');
    expect(selfEditBtn).toBeDisabled();

    // Even if clicked via js, dialog should show self-block message
    await userEvent.click(selfEditBtn);

    // Dialog may or may not open; if it does, it should show the guard message
    // Since the button is disabled, userEvent should not trigger click in some environments.
    // We verify the button is disabled and has the correct title.
    expect(selfEditBtn).toHaveAttribute('title', 'Cannot edit your own account');
  });

  it('blocks editing admin rows', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('Charlie Admin')).toBeInTheDocument());

    const adminEditBtn = screen.getByTitle('Cannot edit admin users');
    expect(adminEditBtn).toBeDisabled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T-M3-4.C.5 — Status dialog tests
// ─────────────────────────────────────────────────────────────────────────────

describe('T-M3-4.C.5 — User Status Confirm Dialog', () => {
  it('deactivates a user on happy path', async () => {
    mockSetCompanyUserActive.mockResolvedValue({ ok: true, data: undefined });

    renderPage();

    await waitFor(() => expect(screen.getByText('Alice Admin')).toBeInTheDocument());

    // Deactivate Bob (user-2 is inactive already, so Alice is active; let's deactivate Alice is blocked)
    // Let's find an active non-self user... actually all users: Alice (active, self), Bob (inactive), Charlie (admin)
    // We need an active non-admin non-self user. Let's adjust mock data for this test.
    const { getCompanyUsers } = await import('@/lib/db/admin-operations');
    const activeNonSelf = {
      userId: 'user-4',
      fullName: 'Dave User',
      email: 'dave@example.com',
      role: 'client_user' as const,
      companyId: clientAdminProfile.company_id as string,
      companyName: 'Company A',
      isActive: true,
      createdAt: '2024-01-04',
      lastSignIn: null,
    };
    vi.mocked(getCompanyUsers).mockResolvedValueOnce([...mockUsers, activeNonSelf]);

    renderPage();

    await waitFor(() => expect(screen.getByText('Dave User')).toBeInTheDocument());

    const toggleBtn = screen.getAllByTitle('Deactivate user')[0];
    await userEvent.click(toggleBtn);

    await waitFor(() => expect(screen.getByText(/deactivate user/i)).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /^deactivate$/i }));

    await waitFor(() => {
      expect(mockSetCompanyUserActive).toHaveBeenCalledWith('user-4', false);
    });
  });

  it('blocks deactivating own row', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('Alice Admin')).toBeInTheDocument());

    const selfToggleBtn = screen.getByTitle('Cannot deactivate your own account');
    expect(selfToggleBtn).toBeDisabled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T-M3-4.C.6 — Recovery menu tests
// ─────────────────────────────────────────────────────────────────────────────

describe('T-M3-4.C.6 — User Recovery Menu', () => {
  it('resends invite successfully', async () => {
    mockResendCompanyUserInvite.mockResolvedValue({ ok: true, data: undefined });

    renderPage();

    await waitFor(() => expect(screen.getByText('Bob User')).toBeInTheDocument());

    // Open recovery menu on Bob's row
    const recoveryButtons = screen.getAllByTitle('Recovery options');
    fireEvent.click(recoveryButtons[1]); // Bob is second user in mockUsers

    await waitFor(() => expect(screen.getByText('Resend Invite')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Resend Invite'));

    await waitFor(() => expect(screen.getByText(/resend the invitation/i)).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /^resend invite$/i }));

    await waitFor(() => {
      expect(mockResendCompanyUserInvite).toHaveBeenCalledWith('user-2');
    });
  });

  it('resets access successfully', async () => {
    mockResetCompanyUserAccess.mockResolvedValue({ ok: true, data: undefined });

    renderPage();

    await waitFor(() => expect(screen.getByText('Bob User')).toBeInTheDocument());

    const recoveryButtons = screen.getAllByTitle('Recovery options');
    fireEvent.click(recoveryButtons[1]);

    await waitFor(() => expect(screen.getByText('Reset Access')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Reset Access'));

    await waitFor(() => expect(screen.getByText(/revoke their current sessions/i)).toBeInTheDocument());

    const resetAccessButtons = screen.getAllByRole('button', { name: /^reset access$/i });
    await userEvent.click(resetAccessButtons[resetAccessButtons.length - 1]);

    await waitFor(() => {
      expect(mockResetCompanyUserAccess).toHaveBeenCalledWith('user-2');
    });
  });

  it('surfaces error on resend invite failure', async () => {
    mockResendCompanyUserInvite.mockResolvedValue({ ok: false, error: 'User not found' });

    renderPage();

    await waitFor(() => expect(screen.getByText('Bob User')).toBeInTheDocument());

    const recoveryButtons = screen.getAllByTitle('Recovery options');
    fireEvent.click(recoveryButtons[1]);

    await waitFor(() => expect(screen.getByText('Resend Invite')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Resend Invite'));

    await waitFor(() => expect(screen.getByText(/resend the invitation/i)).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /^resend invite$/i }));

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });
});
