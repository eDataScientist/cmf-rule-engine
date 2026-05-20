import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import DatasetDetail from './index';
import { useAuth } from '@/lib/auth/context';
import { useWriteAccess } from '@/hooks/useWriteAccess';
import { useDatasetDetails } from './hooks/useDatasetDetails';
import { useQualityMetrics, type QualityMetrics } from './hooks/useQualityMetrics';
import { useTreeAssociations } from './hooks/useTreeAssociations';
import { useDimensions } from './hooks/useDimensions';
import { useDataPreview } from './hooks/useDataPreview';
import { useDatasetDelete } from './hooks/useDatasetDelete';
import { useAlignmentEditor } from './hooks/useAlignmentEditor';
import { useAlignmentSave } from './hooks/useAlignmentSave';

// Mock all details hooks
vi.mock('@/lib/auth/context');
vi.mock('@/hooks/useWriteAccess');
vi.mock('./hooks/useDatasetDetails');
vi.mock('./hooks/useQualityMetrics');
vi.mock('./hooks/useTreeAssociations');
vi.mock('./hooks/useDimensions');
vi.mock('./hooks/useDataPreview');
vi.mock('./hooks/useDatasetDelete');
vi.mock('./hooks/useAlignmentEditor');
vi.mock('./hooks/useAlignmentSave');

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
  granularity: 'claim' as const,
  alignmentMapping: {},
};

describe('DatasetDetail - Write Gating Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useDatasetDetails).mockReturnValue({
      dataset: mockDataset,
      loading: false,
      error: null,
      updateDataset: vi.fn(),
    });
    vi.mocked(useQualityMetrics).mockReturnValue({
      quality: {
        dataset_id: 1,
        total_dimensions: 10,
        present_dimensions: 10,
        completeness_percentage: 100,
        missing_critical_columns: [],
        critical_completeness_percentage: 100,
        quality_score: 100,
      } as unknown as QualityMetrics,
      loading: false,
    });
    vi.mocked(useTreeAssociations).mockReturnValue({
      associations: [],
      loading: false,
      refetch: vi.fn(),
    });
    vi.mocked(useDimensions).mockReturnValue({
      dimensions: [],
      loading: false,
    });
    vi.mocked(useDataPreview).mockReturnValue({
      previewData: [],
      loading: false,
      loadPreview: vi.fn(),
      currentPage: 0,
      totalPages: 1,
      totalRows: 0,
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      pageSize: 10,
    });
    vi.mocked(useDatasetDelete).mockReturnValue({
      handleDelete: vi.fn(),
      deleting: false,
    });
    vi.mocked(useAlignmentEditor).mockReturnValue({
      editMode: false,
      editableAlignment: {},
      validationError: null,
      hasChanges: false,
      startEdit: vi.fn(),
      cancelEdit: vi.fn(),
      handleDimensionChange: vi.fn(),
      validate: vi.fn(),
    });
    vi.mocked(useAlignmentSave).mockReturnValue({
      saveAlignment: vi.fn(),
      saving: false,
    });
  });

  it('renders read-only view for client_user (Edit Mapping disabled, Tree Links hidden)', () => {
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

    vi.mocked(useWriteAccess).mockReturnValue({
      canWrite: false,
      role: 'client_user',
    });

    render(
      <MemoryRouter initialEntries={['/datasets/1']}>
        <Routes>
          <Route path="/datasets/:id" element={<DatasetDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Delete button in header should be hidden
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();

    // Link/Create Tree buttons should be hidden (while Overview tab is active on mount)
    expect(screen.queryByRole('button', { name: /link existing/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create new/i })).not.toBeInTheDocument();

    // Switch to Schema Map tab
    fireEvent.click(screen.getByText('Schema Map'));

    // Schema edit button should be disabled
    const editBtn = screen.getByRole('button', { name: /edit mapping/i });
    expect(editBtn).toBeInTheDocument();
    expect(editBtn).toBeDisabled();
    expect(editBtn.getAttribute('title')).toBe('Read-only access for client users.');
  });

  it('renders fully interactive view for admin', () => {
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

    vi.mocked(useWriteAccess).mockReturnValue({
      canWrite: true,
      role: 'admin',
    });

    render(
      <MemoryRouter initialEntries={['/datasets/1']}>
        <Routes>
          <Route path="/datasets/:id" element={<DatasetDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Delete button in header should be visible
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();

    // Link/Create Tree buttons should be visible (on Overview tab, active on mount)
    expect(screen.getByRole('button', { name: /link existing/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create new/i })).toBeInTheDocument();

    // Switch to Schema Map tab
    fireEvent.click(screen.getByText('Schema Map'));

    // Schema edit button should be enabled
    const editBtn = screen.getByRole('button', { name: /edit mapping/i });
    expect(editBtn).toBeInTheDocument();
    expect(editBtn).not.toBeDisabled();
  });
});
