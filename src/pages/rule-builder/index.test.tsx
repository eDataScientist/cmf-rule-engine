import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import RuleBuilder from './index';
import { useAuth } from '@/lib/auth/context';
import { useWriteAccess } from '@/hooks/useWriteAccess';
import { useRuleSetLoad } from './hooks/useRuleSetLoad';
import { useRuleAutoSave } from './hooks/useRuleAutoSave';
import { useDatasetDimensions } from './hooks/useDatasetDimensions';

// Mock all necessary hooks
vi.mock('@/lib/auth/context');
vi.mock('@/hooks/useWriteAccess');
vi.mock('./hooks/useDatasetDimensions');
vi.mock('./hooks/useRuleSetLoad');
vi.mock('./hooks/useRuleAutoSave');

describe('RuleBuilder - Write Access Gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks for standard ruleset loading
    vi.mocked(useDatasetDimensions).mockReturnValue(undefined);
    vi.mocked(useRuleSetLoad).mockReturnValue({
      loading: false,
      error: null,
      hasLoaded: true,
    });
    vi.mocked(useRuleAutoSave).mockReturnValue({
      saveStatus: 'saved',
      lastSavedAt: new Date(),
      save: vi.fn(),
    });
  });

  it('renders disabled save button with read-only tooltip for client_user', () => {
    // Mock user context as client_user
    vi.mocked(useAuth).mockReturnValue({
      user: {} as unknown as User,
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

    // Mock write access as false
    vi.mocked(useWriteAccess).mockReturnValue({
      canWrite: false,
      role: 'client_user',
    });

    render(
      <MemoryRouter initialEntries={['/rule-builder/1']}>
        <Routes>
          <Route path="/rule-builder/:datasetId" element={<RuleBuilder />} />
        </Routes>
      </MemoryRouter>
    );

    // Get input field - should be disabled
    const input = screen.getByPlaceholderText(/read-only access for client users/i);
    expect(input).toBeInTheDocument();
    expect(input).toBeDisabled();

    // The effect toggle button should also be disabled
    const effectBtn = screen.getByTitle('Read-only access');
    expect(effectBtn).toBeInTheDocument();
    expect(effectBtn).toBeDisabled();
  });

  it('renders fully functional inputs and active state for admin', () => {
    // Mock user context as admin
    vi.mocked(useAuth).mockReturnValue({
      user: {} as unknown as User,
      session: null,
      profile: {
        user_id: 'admin-1',
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

    // Mock write access as true
    vi.mocked(useWriteAccess).mockReturnValue({
      canWrite: true,
      role: 'admin',
    });

    render(
      <MemoryRouter initialEntries={['/rule-builder/1']}>
        <Routes>
          <Route path="/rule-builder/:datasetId" element={<RuleBuilder />} />
        </Routes>
      </MemoryRouter>
    );

    // Get input field - should be enabled and show regular placeholder
    const input = screen.getByPlaceholderText(/type a rule.../i);
    expect(input).toBeInTheDocument();
    expect(input).not.toBeDisabled();

    // The effect toggle button should be enabled
    const effectBtn = screen.getByTitle('Click to toggle between High and Moderate risk');
    expect(effectBtn).toBeInTheDocument();
    expect(effectBtn).not.toBeDisabled();
  });
});

