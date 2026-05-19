import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import ReviewTrees from './index';
import { useAuth } from '@/lib/auth/context';
import { useTreeList } from './hooks/useTreeList';
import { useTreeDelete } from './hooks/useTreeDelete';
import type { Tree } from '@/lib/types/tree';

vi.mock('@/lib/auth/context');
vi.mock('./hooks/useTreeList');
vi.mock('./hooks/useTreeDelete');

const mockUser: User = {
  id: 'user-1',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'client@test.com',
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

const mockTree: Tree = {
  id: 'tree-1',
  name: 'Test Tree',
  treeType: 'motor',
  structure: [],
  companyId: 'company-1',
  createdAt: new Date(),
};

describe('ReviewTrees - Client User Negative Access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hides the "New Tree" button for client_user', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      profile: {
        user_id: 'user-1',
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

    vi.mocked(useTreeList).mockReturnValue({
      trees: [mockTree],
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useTreeDelete).mockReturnValue({
      remove: vi.fn(),
      isDeleting: false,
    } as any);

    render(
      <MemoryRouter>
        <ReviewTrees />
      </MemoryRouter>
    );

    // New Tree button should not be present
    expect(screen.queryByRole('button', { name: /new tree/i })).not.toBeInTheDocument();
  });

  it('shows "New Tree" button for admin', () => {
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

    vi.mocked(useTreeList).mockReturnValue({
      trees: [mockTree],
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useTreeDelete).mockReturnValue({
      remove: vi.fn(),
      isDeleting: false,
    } as any);

    render(
      <MemoryRouter>
        <ReviewTrees />
      </MemoryRouter>
    );

    // New Tree button should be present for admin
    expect(screen.getByRole('button', { name: /new tree/i })).toBeInTheDocument();
  });

  it('shows "New Tree" button for client_admin', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      profile: {
        user_id: 'user-1',
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

    vi.mocked(useTreeList).mockReturnValue({
      trees: [mockTree],
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useTreeDelete).mockReturnValue({
      remove: vi.fn(),
      isDeleting: false,
    } as any);

    render(
      <MemoryRouter>
        <ReviewTrees />
      </MemoryRouter>
    );

    // New Tree button should be present for client_admin
    expect(screen.getByRole('button', { name: /new tree/i })).toBeInTheDocument();
  });
});
