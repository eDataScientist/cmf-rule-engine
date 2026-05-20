import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CompanyOverview from '../index';
import { useCompanyOverview } from '../hooks/useCompanyOverview';
import { requestCompanySlots, cancelSlotRequest } from '@/lib/db/client-operations';

// Mock client-operations
vi.mock('@/lib/db/client-operations', () => ({
  requestCompanySlots: vi.fn(),
  cancelSlotRequest: vi.fn(),
}));

// Mock hook
vi.mock('../hooks/useCompanyOverview', () => ({
  useCompanyOverview: vi.fn(),
}));

// Mock SetAtom
const mockSetBreadcrumbs = vi.fn();
vi.mock('jotai', () => ({
  useSetAtom: () => mockSetBreadcrumbs,
}));

vi.mock('@/store/atoms/header', () => ({
  headerBreadcrumbsAtom: { __type: 'atom' },
}));

describe('CompanyOverview Page (Stream B)', () => {
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupMockData = (overrides = {}) => {
    const defaultData = {
      company: {
        id: 'company-a',
        name: 'Company A',
        maxUserSlots: 10,
        isActive: true,
      },
      totalUsers: 4,
      activeUsers: 3,
      pendingRequest: null,
      activities: [
        {
          id: 'log-1',
          action: 'register_user',
          userName: 'Admin Alice',
          createdAt: new Date().toISOString(),
          targetType: 'user',
          targetId: 'user-1',
          details: null,
        },
      ],
    };

    vi.mocked(useCompanyOverview).mockReturnValue({
      data: { ...defaultData, ...overrides },
      loading: false,
      error: null,
      refresh: mockRefresh,
    });
  };

  it('renders summary cards with correct values (T-M3-4.B.2.1)', () => {
    setupMockData();
    render(
      <MemoryRouter>
        <CompanyOverview />
      </MemoryRouter>
    );

    expect(screen.getByText('Total Slots')).toBeDefined();
    expect(screen.getByText('10')).toBeDefined();

    expect(screen.getByText('Total Users')).toBeDefined();
    expect(screen.getByText('4')).toBeDefined();

    expect(screen.getByText('Available Slots')).toBeDefined();
    expect(screen.getByText('6')).toBeDefined();
  });

  it('renders recent activity feed correctly (T-M3-4.B.2.2)', () => {
    setupMockData();
    render(
      <MemoryRouter>
        <CompanyOverview />
      </MemoryRouter>
    );

    expect(screen.getByText('Recent Activity')).toBeDefined();
    expect(screen.getByText('Registered user')).toBeDefined();
    expect(screen.getByText('By Admin Alice')).toBeDefined();
  });

  it('renders empty recent activity state', () => {
    setupMockData({ activities: [] });
    render(
      <MemoryRouter>
        <CompanyOverview />
      </MemoryRouter>
    );

    expect(screen.getByText('No recent activity recorded.')).toBeDefined();
  });

  it('renders populated recent activity', () => {
    setupMockData({
      activities: [
        { id: 'a1', action: 'register_user', userName: 'User One', createdAt: new Date().toISOString(), targetType: 'user', targetId: 'u1', details: null },
        { id: 'a2', action: 'deactivate_user', userName: 'User Two', createdAt: new Date().toISOString(), targetType: 'user', targetId: 'u2', details: null },
      ],
    });
    render(
      <MemoryRouter>
        <CompanyOverview />
      </MemoryRouter>
    );

    expect(screen.getByText('Registered user')).toBeDefined();
    expect(screen.getByText('Deactivated user')).toBeDefined();
    expect(screen.getByText('By User One')).toBeDefined();
    expect(screen.getByText('By User Two')).toBeDefined();
  });

  it('allows requesting slot modal flow (T-M3-4.B.3.1)', async () => {
    setupMockData();
    vi.mocked(requestCompanySlots).mockResolvedValue({ ok: true, data: { requestId: 'req-new' } });

    render(
      <MemoryRouter>
        <CompanyOverview />
      </MemoryRouter>
    );

    // Open request dialog
    const requestBtn = screen.getByText('Request More Slots');
    fireEvent.click(requestBtn);

    expect(screen.getByText('Request Additional Slots')).toBeDefined();

    // Trigger submit
    const submitBtn = screen.getByText('Submit Request');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(requestCompanySlots).toHaveBeenCalledWith(1);
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('handles backend error in slot request (T-M3-4.B.3.3)', async () => {
    setupMockData();
    vi.mocked(requestCompanySlots).mockResolvedValue({ ok: false, error: 'Database capacity limit' });

    render(
      <MemoryRouter>
        <CompanyOverview />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Request More Slots'));
    fireEvent.click(screen.getByText('Submit Request'));

    await waitFor(() => {
      expect(screen.getByText('Database capacity limit')).toBeDefined();
    });
  });

  it('shows cancel button when pending request exists (T-M3-4.B.3.2)', async () => {
    setupMockData({
      pendingRequest: {
        id: 'existing-req',
        requestedSlots: 3,
        status: 'pending',
      },
    });

    render(
      <MemoryRouter>
        <CompanyOverview />
      </MemoryRouter>
    );

    // Cancel button should be visible when there's a pending request (not Request More Slots)
    expect(screen.getByText('Cancel Pending Request')).toBeDefined();
    expect(screen.queryByText('Request More Slots')).toBeNull();
  });

  it('quick links button navigates to /company/users (T-M3-4.B.2.3)', async () => {
    setupMockData();

    render(
      <MemoryRouter initialEntries={['/company']}>
        <CompanyOverview />
      </MemoryRouter>
    );

    const quickLinksBtn = screen.getByText('Manage Company Users');
    expect(quickLinksBtn).toBeDefined();
    // The Link component wraps the button
    expect(quickLinksBtn.closest('a')?.getAttribute('href')).toBe('/company/users');
  });

  it('allows cancelling pending slot request (T-M3-4.B.4.1)', async () => {
    setupMockData({
      pendingRequest: {
        id: 'request-foo',
        requestedSlots: 5,
        status: 'pending',
      },
    });
    vi.mocked(cancelSlotRequest).mockResolvedValue({ ok: true, data: undefined });

    render(
      <MemoryRouter>
        <CompanyOverview />
      </MemoryRouter>
    );

    expect(screen.getByText('Pending Review')).toBeDefined();
    const cancelBtn = screen.getByText('Cancel Pending Request');
    fireEvent.click(cancelBtn);

    expect(screen.getByText('Cancel Slot Request')).toBeDefined();
    expect(screen.getByText(/Are you sure you want to cancel/)).toBeDefined();

    fireEvent.click(screen.getByText('Confirm Cancellation'));

    await waitFor(() => {
      expect(cancelSlotRequest).toHaveBeenCalledWith('request-foo');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('handles cancel failure race with admin approve (T-M3-4.B.4.2)', async () => {
    setupMockData({
      pendingRequest: {
        id: 'request-bar',
        requestedSlots: 2,
        status: 'pending',
      },
    });
    vi.mocked(cancelSlotRequest).mockResolvedValue({ ok: false, error: 'Already processed by admin' });

    render(
      <MemoryRouter>
        <CompanyOverview />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Cancel Pending Request'));
    expect(screen.getByText('Cancel Slot Request')).toBeDefined();
    fireEvent.click(screen.getByText('Confirm Cancellation'));

    await waitFor(() => {
      expect(screen.getByText('Already processed by admin')).toBeDefined();
    });
  });

  it('renders empty state for no pending request', () => {
    setupMockData({ pendingRequest: null });
    render(
      <MemoryRouter>
        <CompanyOverview />
      </MemoryRouter>
    );

    expect(screen.getByText('No pending slot requests.')).toBeDefined();
    expect(screen.getByText('Request More Slots')).toBeDefined();
  });
});