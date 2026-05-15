import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import Datasets from './index';
import { useAuth } from '@/lib/auth/context';

vi.mock('@/lib/auth/context');
vi.mock('@/lib/db/operations', () => ({
  getDatasets: vi.fn(() => Promise.resolve([])),
  deleteDataset: vi.fn(),
}));
vi.mock('@/lib/db/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
      })),
    })),
    removeChannel: vi.fn(),
  },
}));

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

describe('Datasets - Client User Negative Access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hides the "Upload Dataset" button for client_user', async () => {
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

    render(
      <MemoryRouter>
        <Datasets />
      </MemoryRouter>
    );

    // Wait for loading to finish
    await new Promise(resolve => setTimeout(resolve, 100));

    // Upload button should not be present
    expect(screen.queryByRole('button', { name: /upload dataset/i })).not.toBeInTheDocument();
  });

  it('shows the "Upload Dataset" button for admin', async () => {
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

    render(
      <MemoryRouter>
        <Datasets />
      </MemoryRouter>
    );

    // Wait for loading to finish
    await new Promise(resolve => setTimeout(resolve, 100));

    // Upload button should be present for admin (check by getAllByRole to verify at least one exists)
    const uploadButtons = screen.getAllByRole('button', { name: /upload dataset/i });
    expect(uploadButtons.length).toBeGreaterThan(0);
  });

  it('shows the "Upload Dataset" button for client_admin', async () => {
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

    render(
      <MemoryRouter>
        <Datasets />
      </MemoryRouter>
    );

    // Wait for loading to finish
    await new Promise(resolve => setTimeout(resolve, 100));

    // Upload button should be present for client_admin
    const uploadButtons = screen.getAllByRole('button', { name: /upload dataset/i });
    expect(uploadButtons.length).toBeGreaterThan(0);
  });
});
