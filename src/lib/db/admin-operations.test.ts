import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateUser, resendUserInvite, resetUserAccess } from './admin-operations';

// --- Supabase mock (hoisted so vi.mock factory can reference them) ---

const { mockFrom, mockGetUser, mockInvoke } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetUser: vi.fn(),
  mockInvoke: vi.fn(),
}));

vi.mock('./supabase', () => ({
  supabase: {
    from: mockFrom,
    rpc: vi.fn(),
    auth: { getUser: mockGetUser },
    functions: { invoke: mockInvoke },
  },
}));

// --- Tests ---

describe('admin-operations - D.3 cross-stream audit operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: auth.getUser returns a valid admin user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-uid' } },
      error: null,
    });
  });

  describe('updateUser', () => {
    it('calls user_profiles update with correct column mapping', async () => {
      // from('user_profiles').update(...).eq(...) chain
      const updateChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };
      // from('admin_activity_log').insert(...) chain
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockFrom
        .mockReturnValueOnce(updateChain)
        .mockReturnValueOnce(insertChain);

      await updateUser('user-123', {
        fullName: 'New Name',
        role: 'client_admin',
        companyId: 'co-456',
      });

      expect(updateChain.update).toHaveBeenCalledWith({
        full_name: 'New Name',
        role: 'client_admin',
        company_id: 'co-456',
      });
      expect(updateChain.update().eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('logs edit_user action to admin_activity_log', async () => {
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      const updateChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };

      mockFrom
        .mockReturnValueOnce(updateChain)
        .mockReturnValueOnce(insertChain);

      await updateUser('user-123', { fullName: 'Updated Name' });

      expect(insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'edit_user',
          target_type: 'user',
          target_id: 'user-123',
        })
      );
    });

    it('throws if update fails', async () => {
      const updateChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'DB error' } }),
        }),
      };
      mockFrom.mockReturnValueOnce(updateChain);

      await expect(updateUser('user-123', { fullName: 'X' })).rejects.toThrow(
        'Failed to update user'
      );
    });

    it('only maps provided update fields', async () => {
      const updateChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      mockFrom
        .mockReturnValueOnce(updateChain)
        .mockReturnValueOnce(insertChain);

      await updateUser('user-123', { role: 'client_user' });

      expect(updateChain.update).toHaveBeenCalledWith({ role: 'client_user' });
      // fullName and companyId should NOT appear
      expect(updateChain.update).not.toHaveBeenCalledWith(
        expect.objectContaining({ full_name: expect.anything() })
      );
    });
  });

  describe('resendUserInvite', () => {
    it('invokes resend-user-invite edge function with correct body', async () => {
      mockInvoke.mockResolvedValue({ data: {}, error: null });
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      mockFrom.mockReturnValue(insertChain);

      await resendUserInvite('user-abc');

      expect(mockInvoke).toHaveBeenCalledWith('resend-user-invite', {
        body: { user_id: 'user-abc' },
      });
    });

    it('logs resend_user_invite action to admin_activity_log', async () => {
      mockInvoke.mockResolvedValue({ data: {}, error: null });
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      mockFrom.mockReturnValue(insertChain);

      await resendUserInvite('user-abc');

      expect(insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'resend_user_invite',
          target_type: 'user',
          target_id: 'user-abc',
        })
      );
    });

    it('throws if edge function returns an error', async () => {
      mockInvoke.mockResolvedValue({ data: null, error: { message: 'Function error' } });

      await expect(resendUserInvite('user-abc')).rejects.toThrow('Function error');
    });

    it('throws if edge function returns data.error', async () => {
      mockInvoke.mockResolvedValue({ data: { error: 'User not found' }, error: null });

      await expect(resendUserInvite('user-abc')).rejects.toThrow('User not found');
    });
  });

  describe('resetUserAccess', () => {
    it('invokes reset-user-access edge function with correct body', async () => {
      mockInvoke.mockResolvedValue({ data: {}, error: null });
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      mockFrom.mockReturnValue(insertChain);

      await resetUserAccess('user-xyz');

      expect(mockInvoke).toHaveBeenCalledWith('reset-user-access', {
        body: { user_id: 'user-xyz' },
      });
    });

    it('logs reset_user_access action to admin_activity_log', async () => {
      mockInvoke.mockResolvedValue({ data: {}, error: null });
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      mockFrom.mockReturnValue(insertChain);

      await resetUserAccess('user-xyz');

      expect(insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'reset_user_access',
          target_type: 'user',
          target_id: 'user-xyz',
        })
      );
    });

    it('throws if edge function returns an error', async () => {
      mockInvoke.mockResolvedValue({ data: null, error: { message: 'Network error' } });

      await expect(resetUserAccess('user-xyz')).rejects.toThrow('Network error');
    });

    it('throws if edge function returns data.error', async () => {
      mockInvoke.mockResolvedValue({ data: { error: 'Account inactive' }, error: null });

      await expect(resetUserAccess('user-xyz')).rejects.toThrow('Account inactive');
    });
  });
});
