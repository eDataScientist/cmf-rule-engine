import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import UploadModal from './UploadModal';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/db/supabase';

const mockSupabaseFrom = vi.fn();
(supabase as any).from = mockSupabaseFrom;

vi.mock('@/lib/auth/context');
vi.mock('@/lib/db/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } }, error: null }),
    },
  },
}));
vi.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    isDragActive: false,
  }),
}));

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
} as any;

const mockCompanies = [
  { id: 'company-1', name: 'AXA', is_active: true },
  { id: 'company-2', name: 'Allianz', is_active: true },
  { id: 'company-3', name: 'Inactive Corp', is_active: false },
];

describe('UploadModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      profile: null,
      loading: false,
      signIn: vi.fn(),
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    });
  });

  it('renders insurance company as a dropdown instead of free text input', async () => {
    // Mock supabase to return companies
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockCompanies, error: null }),
    });

    render(
      <UploadModal
        open={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    await waitFor(() => {
      // Should render a select element (dropdown) for insurance company
      const companySelect = screen.getByRole('combobox', { name: /insurance company/i });
      expect(companySelect).toBeDefined();
    });

    // Should NOT render a free text input for insurance company
    const textInput = screen.queryByPlaceholderText(/e\.g\.\s*,?\s*GIG\s*,?\s*AXA/i);
    expect(textInput).toBeNull();
  });

  it('populates dropdown with active companies from database', async () => {
    const activeCompanies = mockCompanies.filter(c => c.is_active);
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: activeCompanies, error: null }),
    });

    render(
      <UploadModal
        open={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('AXA')).toBeDefined();
      expect(screen.getByText('Allianz')).toBeDefined();
    });

    // Inactive companies should not appear
    expect(screen.queryByText('Inactive Corp')).toBeNull();
  });

  it('disables submit button when no company is selected', async () => {
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockCompanies, error: null }),
    });

    render(
      <UploadModal
        open={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    await waitFor(() => {
      const submitBtn = screen.getByRole('button', { name: /begin ingestion/i });
      expect(submitBtn).toBeDisabled();
    });
  });

  it('shows error when company fetch fails', async () => {
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
    });

    render(
      <UploadModal
        open={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load companies/i)).toBeDefined();
    });
  });
});
