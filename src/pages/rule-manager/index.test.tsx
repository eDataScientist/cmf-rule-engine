import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import RuleManagerPage from './index';
import { useAuth } from '@/lib/auth/context';
import { useDatasetRulesets } from './hooks/useDatasetRulesets';

vi.mock('@/lib/auth/context');
vi.mock('./hooks/useDatasetRulesets');

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

const mockDataset = {
  id: 1,
  fileName: 'test.csv',
  insuranceCompany: 'Test Company',
  country: 'US',
  datePeriod: '2023-2024',
  rows: 1000,
  columns: 50,
  claimCategory: 'motor' as const,
  company_id: 'company-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  uploadedAt: new Date().toISOString(),
  rawFilePath: '/path/to/raw.csv',
  alignedFilePath: '/path/to/aligned.csv',
  nickname: 'Test Dataset',
  granularity: 'claim',
  alignmentMapping: {},
  ruleset: {
    ruleCount: 5,
    lastEditedAt: new Date().toISOString(),
  },
};

describe('RuleManager - Client User Negative Access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "Read-only access" message for client_user', () => {
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

    vi.mocked(useDatasetRulesets).mockReturnValue({
      datasets: [mockDataset],
      loading: false,
      error: null,
    } as any);

    render(
      <MemoryRouter>
        <RuleManagerPage />
      </MemoryRouter>
    );

    // Edit/Create buttons should not be present
    expect(screen.queryByRole('button', { name: /edit rules/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create rules/i })).not.toBeInTheDocument();

    // Read-only message should be shown
    expect(screen.getByText(/read-only access/i)).toBeInTheDocument();
  });

  it('shows "Edit Rules" button for admin', () => {
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

    vi.mocked(useDatasetRulesets).mockReturnValue({
      datasets: [mockDataset],
      loading: false,
      error: null,
    } as any);

    render(
      <MemoryRouter>
        <RuleManagerPage />
      </MemoryRouter>
    );

    // Edit Rules button should be present for admin
    expect(screen.getByRole('button', { name: /edit rules/i })).toBeInTheDocument();
  });

  it('shows "Edit Rules" button for client_admin', () => {
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

    vi.mocked(useDatasetRulesets).mockReturnValue({
      datasets: [mockDataset],
      loading: false,
      error: null,
    } as any);

    render(
      <MemoryRouter>
        <RuleManagerPage />
      </MemoryRouter>
    );

    // Edit Rules button should be present for client_admin
    expect(screen.getByRole('button', { name: /edit rules/i })).toBeInTheDocument();
  });
});
