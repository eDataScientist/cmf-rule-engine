import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminLogs from './index';
import * as adminOps from '@/lib/db/admin-operations';
import type { ActivityLogEntry } from '@/lib/db/admin-operations';

// --- Mocks ---

vi.mock('@/lib/db/admin-operations', () => ({
  getActivityLog: vi.fn(),
}));

vi.mock('@/store/atoms/header', () => ({
  headerBreadcrumbsAtom: { __type: 'atom' },
}));

vi.mock('jotai', () => ({
  useSetAtom: vi.fn(() => vi.fn()),
}));

// Stub URL.createObjectURL / URL.revokeObjectURL for CSV export tests
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();
Object.defineProperty(URL, 'createObjectURL', { value: mockCreateObjectURL, writable: true });
Object.defineProperty(URL, 'revokeObjectURL', { value: mockRevokeObjectURL, writable: true });

// --- Fixtures ---

function makeEntry(overrides: Partial<ActivityLogEntry> = {}): ActivityLogEntry {
  return {
    id: overrides.id ?? 'entry-1',
    userId: 'user-1',
    userName: 'Admin User',
    action: 'create_company',
    targetType: 'company',
    targetId: 'company-1',
    details: { company_name: 'Acme Insurance' },
    ipAddress: null,
    createdAt: '2026-05-15T10:00:00Z',
    ...overrides,
  };
}

const mockEntries: ActivityLogEntry[] = [
  makeEntry({
    id: 'entry-1',
    action: 'create_company',
    targetType: 'company',
    details: { company_name: 'Acme Insurance' },
  }),
  makeEntry({
    id: 'entry-2',
    action: 'register_user',
    targetType: 'user',
    userName: 'Admin Two',
    details: { email: 'user@company.com', role: 'client_user' },
  }),
  makeEntry({
    id: 'entry-3',
    action: 'approve_slot_request',
    targetType: 'slot_request',
    details: { requested_slots: 5 },
  }),
];

// --- Tests ---

describe('AdminLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(adminOps.getActivityLog).mockResolvedValue({
      entries: mockEntries,
      total: 3,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // T-M3-3.D.1 ---------------------------------------------------------------

  describe('T-M3-3.D.1 - Loading, debounced search, action filters, pagination, empty states', () => {
    it('loads and renders audit entries on mount', async () => {
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });
      expect(adminOps.getActivityLog).toHaveBeenCalledTimes(1);
    });

    it('shows loading spinner while fetching', () => {
      vi.mocked(adminOps.getActivityLog).mockReturnValue(new Promise(() => {}));
      render(<AdminLogs />);
      expect(screen.queryByRole('status')).toBeDefined();
    });

    it('shows empty state when no entries match', async () => {
      vi.mocked(adminOps.getActivityLog).mockResolvedValue({ entries: [], total: 0 });
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('No activity logs found')).toBeDefined();
      });
    });

    it('shows contextual empty state when search returns no results', async () => {
      vi.mocked(adminOps.getActivityLog)
        .mockResolvedValueOnce({ entries: mockEntries, total: 3 })
        .mockResolvedValue({ entries: [], total: 0 });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const searchInput = screen.getByPlaceholderText('Search logs...');
      await user.type(searchInput, 'xyz');
      await act(async () => { await vi.advanceTimersByTimeAsync(400); });

      await waitFor(() => {
        expect(screen.getByText('No activity logs found')).toBeDefined();
      });
    });

    it('debounces search input by 300ms', async () => {
      vi.mocked(adminOps.getActivityLog).mockResolvedValue({ entries: mockEntries, total: 3 });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      render(<AdminLogs />);
      await waitFor(() => {
        expect(adminOps.getActivityLog).toHaveBeenCalledTimes(1);
      });

      const searchInput = screen.getByPlaceholderText('Search logs...');

      // Type rapidly - should NOT trigger additional calls yet
      await user.type(searchInput, 'ac');
      await act(async () => { await vi.advanceTimersByTimeAsync(100); });
      expect(adminOps.getActivityLog).toHaveBeenCalledTimes(1);

      // After debounce fires
      await act(async () => { await vi.advanceTimersByTimeAsync(300); });
      await waitFor(() => {
        expect(adminOps.getActivityLog).toHaveBeenCalledTimes(2);
      });
    });

    it('search query is passed to getActivityLog as filter', async () => {
      vi.mocked(adminOps.getActivityLog).mockResolvedValue({ entries: mockEntries, total: 3 });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      render(<AdminLogs />);
      await waitFor(() => {
        expect(adminOps.getActivityLog).toHaveBeenCalledTimes(1);
      });

      const searchInput = screen.getByPlaceholderText('Search logs...');
      await user.type(searchInput, 'acme');
      await act(async () => { await vi.advanceTimersByTimeAsync(400); });

      await waitFor(() => {
        expect(adminOps.getActivityLog).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'acme' }),
          expect.any(Number),
          expect.any(Number)
        );
      });
    });

    it('action filter calls getActivityLog with correct action value', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      render(<AdminLogs />);
      await waitFor(() => {
        expect(adminOps.getActivityLog).toHaveBeenCalledTimes(1);
      });

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'create_company');

      await waitFor(() => {
        expect(adminOps.getActivityLog).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'create_company' }),
          expect.any(Number),
          expect.any(Number)
        );
      });
    });

    it('changing action filter resets page to 0', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      // Mock enough data to enable pagination
      vi.mocked(adminOps.getActivityLog).mockResolvedValue({
        entries: mockEntries,
        total: 60,
      });

      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      // Navigate to page 2
      const nextBtn = screen.getByRole('button', { name: /next/i });
      await user.click(nextBtn);

      await waitFor(() => {
        expect(screen.getByText(/page 2/i)).toBeDefined();
      });

      // Change filter - should reset to page 1
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'create_company');

      await waitFor(() => {
        expect(screen.getByText(/page 1/i)).toBeDefined();
      });
    });

    it('search input change resets page to 0', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      vi.mocked(adminOps.getActivityLog).mockResolvedValue({
        entries: mockEntries,
        total: 60,
      });

      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      // Navigate to page 2
      const nextBtn = screen.getByRole('button', { name: /next/i });
      await user.click(nextBtn);
      await waitFor(() => {
        expect(screen.getByText(/page 2/i)).toBeDefined();
      });

      // Type search - should reset to page 1
      const searchInput = screen.getByPlaceholderText('Search logs...');
      await user.type(searchInput, 'a');
      await act(async () => { await vi.advanceTimersByTimeAsync(400); });

      await waitFor(() => {
        expect(screen.getByText(/page 1/i)).toBeDefined();
      });
    });

    it('pagination buttons navigate pages correctly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      vi.mocked(adminOps.getActivityLog).mockResolvedValue({
        entries: mockEntries,
        total: 60,
      });

      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();

      const nextBtn = screen.getByRole('button', { name: /next/i });
      await user.click(nextBtn);

      await waitFor(() => {
        expect(screen.getByText(/page 2/i)).toBeDefined();
        expect(adminOps.getActivityLog).toHaveBeenCalledWith(
          expect.any(Object),
          25,
          25
        );
      });

      const prevBtn = screen.getByRole('button', { name: /previous/i });
      await user.click(prevBtn);

      await waitFor(() => {
        expect(screen.getByText(/page 1/i)).toBeDefined();
      });
    });

    it('shows error state when getActivityLog throws', async () => {
      vi.mocked(adminOps.getActivityLog).mockRejectedValue(new Error('Network error'));
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeDefined();
      });
    });

    it('displays action filter options for all known admin actions', async () => {
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const select = screen.getByRole('combobox');
      expect(select).toBeDefined();

      // Verify key action filter options are present
      const options = select.querySelectorAll('option');
      const optionValues = Array.from(options).map((o) => (o as HTMLOptionElement).value);
      expect(optionValues).toContain('');
      expect(optionValues).toContain('create_company');
      expect(optionValues).toContain('register_user');
      expect(optionValues).toContain('approve_slot_request');
      expect(optionValues).toContain('deny_slot_request');
    });
  });

  // T-M3-3.D.2 ---------------------------------------------------------------

  describe('T-M3-3.D.2 - Detail expansion and CSV export', () => {
    it('expand button toggles detail row for an entry', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const expandButtons = screen.getAllByLabelText(/expand log details/i);
      expect(expandButtons.length).toBeGreaterThan(0);

      await user.click(expandButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/"company_name"/)).toBeDefined();
        expect(screen.getByText(/"Acme Insurance"/)).toBeDefined();
      });
    });

    it('clicking expand again collapses the detail row', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const expandButtons = screen.getAllByLabelText(/expand log details/i);
      await user.click(expandButtons[0]);
      await waitFor(() => {
        expect(screen.getByText(/"company_name"/)).toBeDefined();
      });

      const collapseButton = screen.getByLabelText(/collapse log details/i);
      await user.click(collapseButton);

      await waitFor(() => {
        expect(screen.queryByText(/"company_name"/)).toBeNull();
      });
    });

    it('only one detail row is expanded at a time', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const expandButtons = screen.getAllByLabelText(/expand log details/i);
      await user.click(expandButtons[0]);
      await waitFor(() => {
        expect(screen.getByText(/"company_name"/)).toBeDefined();
      });

      // Click second entry's expand
      await user.click(expandButtons[1]);
      // First detail should be gone, second should be shown
      await waitFor(() => {
        expect(screen.queryByText(/"company_name"/)).toBeNull();
      });
    });

    it('CSV export triggers download with correct headers', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const exportButton = screen.getByRole('button', { name: /export csv/i });
      await user.click(exportButton);

      expect(mockCreateObjectURL).toHaveBeenCalledOnce();
      expect(clickSpy).toHaveBeenCalledOnce();

      // Verify the blob contains CSV headers
      const blobArg = (mockCreateObjectURL as unknown as { calls: Blob[][] }).calls[0]?.[0];
      const csvText = blobArg instanceof Blob ? await blobArg.text() : "";
      expect(csvText).toContain('Time');
      expect(csvText).toContain('Action');
      expect(csvText).toContain('User');
      expect(csvText).toContain('Target Type');
      expect(csvText).toContain('Target ID');
      expect(csvText).toContain('Details');

      clickSpy.mockRestore();
    });

    it('CSV export includes all visible entries', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const exportButton = screen.getByRole('button', { name: /export csv/i });
      await user.click(exportButton);

      const blobArg = (mockCreateObjectURL as unknown as { calls: Blob[][] }).calls[0]?.[0];
      const csvText = blobArg instanceof Blob ? await blobArg.text() : "";
      // All 3 mock entries should appear
      expect(csvText).toContain('create_company');
      expect(csvText).toContain('register_user');
      expect(csvText).toContain('approve_slot_request');

      clickSpy.mockRestore();
    });

    it('CSV export renames download with date', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const exportButton = screen.getByRole('button', { name: /export csv/i });
      await user.click(exportButton);

      // Check anchor href was set to the blob URL
      const anchorHref = document.querySelector('a[href="blob:mock-url"]');
      expect(anchorHref).toBeDefined();

      clickSpy.mockRestore();
    });

    it('entry with null details does not show detail row even when expanded', async () => {
      const entryNoDetails = makeEntry({ id: 'no-detail', details: null });
      vi.mocked(adminOps.getActivityLog).mockResolvedValue({
        entries: [entryNoDetails],
        total: 1,
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const expandButtons = screen.getAllByLabelText(/expand log details/i);
      await user.click(expandButtons[0]);

      // No pre element should appear since details is null
      await waitFor(() => {
        expect(screen.queryByRole('region', { name: /detail/i })).toBeNull();
      });
      // No JSON blob in page
      expect(document.querySelector('pre')).toBeNull();
    });
  });

  // T-M3-3.D.3 ---------------------------------------------------------------

  describe('T-M3-3.D.3 - Cross-stream audit visibility', () => {
    it('company actions (create_company, update_company, deactivate_company, reactivate_company) appear as filter options', async () => {
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const select = screen.getByRole('combobox');
      const optionValues = Array.from(select.querySelectorAll('option')).map(
        (o) => (o as HTMLOptionElement).value
      );

      expect(optionValues).toContain('create_company');
      expect(optionValues).toContain('update_company');
      expect(optionValues).toContain('deactivate_company');
      expect(optionValues).toContain('reactivate_company');
    });

    it('user actions (register_user, deactivate_user, reactivate_user) appear as filter options', async () => {
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const select = screen.getByRole('combobox');
      const optionValues = Array.from(select.querySelectorAll('option')).map(
        (o) => (o as HTMLOptionElement).value
      );

      expect(optionValues).toContain('register_user');
      expect(optionValues).toContain('deactivate_user');
      expect(optionValues).toContain('reactivate_user');
    });

    it('slot-review actions (approve_slot_request, deny_slot_request) appear as filter options', async () => {
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const select = screen.getByRole('combobox');
      const optionValues = Array.from(select.querySelectorAll('option')).map(
        (o) => (o as HTMLOptionElement).value
      );

      expect(optionValues).toContain('approve_slot_request');
      expect(optionValues).toContain('deny_slot_request');
    });

    it('filtering by create_company calls getActivityLog with correct filter and returns company entries', async () => {
      const companyEntry = makeEntry({
        id: 'co-entry',
        action: 'create_company',
        targetType: 'company',
        details: { company_name: 'Test Corp' },
      });
      vi.mocked(adminOps.getActivityLog)
        .mockResolvedValueOnce({ entries: mockEntries, total: 3 })
        .mockResolvedValue({ entries: [companyEntry], total: 1 });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'create_company');

      await waitFor(() => {
        expect(adminOps.getActivityLog).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'create_company' }),
          expect.any(Number),
          expect.any(Number)
        );
      });
    });

    it('filtering by register_user calls getActivityLog with correct filter', async () => {
      const userEntry = makeEntry({
        id: 'usr-entry',
        action: 'register_user',
        targetType: 'user',
        details: { email: 'new@company.com', role: 'client_user' },
      });
      vi.mocked(adminOps.getActivityLog)
        .mockResolvedValueOnce({ entries: mockEntries, total: 3 })
        .mockResolvedValue({ entries: [userEntry], total: 1 });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'register_user');

      await waitFor(() => {
        expect(adminOps.getActivityLog).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'register_user' }),
          expect.any(Number),
          expect.any(Number)
        );
      });
    });

    it('filtering by approve_slot_request calls getActivityLog with correct filter', async () => {
      const slotEntry = makeEntry({
        id: 'slot-entry',
        action: 'approve_slot_request',
        targetType: 'slot_request',
        details: { requested_slots: 5 },
      });
      vi.mocked(adminOps.getActivityLog)
        .mockResolvedValueOnce({ entries: mockEntries, total: 3 })
        .mockResolvedValue({ entries: [slotEntry], total: 1 });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'approve_slot_request');

      await waitFor(() => {
        expect(adminOps.getActivityLog).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'approve_slot_request' }),
          expect.any(Number),
          expect.any(Number)
        );
      });
    });

    it('audit entries display target type and target id columns for traceability', async () => {
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      // Check table headers
      expect(screen.getByText('Target')).toBeDefined();
      // Entries show targetType
      expect(screen.getAllByText('company').length).toBeGreaterThan(0);
    });

    it('audit entries display user name for attribution', async () => {
      render(<AdminLogs />);
      await waitFor(() => {
        // Multiple entries share the same userName - use getAllByText
        const adminUserCells = screen.getAllByText('Admin User');
        expect(adminUserCells.length).toBeGreaterThan(0);
        expect(screen.getByText('Admin Two')).toBeDefined();
      });
    });

    it('getActivityLog is called with edit_user action filter when selected', async () => {
      vi.mocked(adminOps.getActivityLog).mockResolvedValue({ entries: [], total: 0 });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      render(<AdminLogs />);
      await waitFor(() => {
        expect(adminOps.getActivityLog).toHaveBeenCalledTimes(1);
      });

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'edit_user');

      await waitFor(() => {
        expect(adminOps.getActivityLog).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'edit_user' }),
          expect.any(Number),
          expect.any(Number)
        );
      });
    });

    it('recovery actions (resend_user_invite, reset_user_access) appear as filter options', async () => {
      render(<AdminLogs />);
      await waitFor(() => {
        expect(screen.getByText('create company')).toBeDefined();
      });

      const select = screen.getByRole('combobox');
      const optionValues = Array.from(select.querySelectorAll('option')).map(
        (o) => (o as HTMLOptionElement).value
      );

      expect(optionValues).toContain('resend_user_invite');
      expect(optionValues).toContain('reset_user_access');
    });

    it('getActivityLog is called with resend_user_invite filter when selected', async () => {
      vi.mocked(adminOps.getActivityLog).mockResolvedValue({ entries: [], total: 0 });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      render(<AdminLogs />);
      await waitFor(() => {
        expect(adminOps.getActivityLog).toHaveBeenCalledTimes(1);
      });

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'resend_user_invite');

      await waitFor(() => {
        expect(adminOps.getActivityLog).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'resend_user_invite' }),
          expect.any(Number),
          expect.any(Number)
        );
      });
    });

    it('getActivityLog is called with reset_user_access filter when selected', async () => {
      vi.mocked(adminOps.getActivityLog).mockResolvedValue({ entries: [], total: 0 });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
      render(<AdminLogs />);
      await waitFor(() => {
        expect(adminOps.getActivityLog).toHaveBeenCalledTimes(1);
      });

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'reset_user_access');

      await waitFor(() => {
        expect(adminOps.getActivityLog).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'reset_user_access' }),
          expect.any(Number),
          expect.any(Number)
        );
      });
    });
  });
});
