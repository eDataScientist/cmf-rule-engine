import { supabase } from './supabase';

/**
 * Discriminated result type for all client-operations
 * Each function returns either { ok: true, data } or { ok: false, error }
 * This simplifies frontend error handling and prevents throwing in async operations
 */
export type ClientOperationResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// --- Types ---

export interface RegisterUserResponse {
  userId: string;
  email: string;
  companyId: string;
  role: 'client_admin' | 'client_user';
}

export interface UpdateUserResponse {
  userId: string;
  fullName: string;
  role: 'client_admin' | 'client_user';
}

// --- Registration ---

/**
 * Register a new user in the current company via edge function
 * Available to admin (any company) and client_admin (same company only)
 */
export async function registerCompanyUser(
  email: string,
  fullName: string,
  role: 'client_admin' | 'client_user'
): Promise<ClientOperationResult<RegisterUserResponse>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: 'Not authenticated' };
    }

    // Get caller profile to extract company_id
    const { data: callerProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !callerProfile) {
      return { ok: false, error: 'Failed to load user profile' };
    }

    // Call edge function
    const { data, error } = await supabase.functions.invoke('register-user', {
      body: {
        email,
        full_name: fullName,
        company_id: callerProfile.company_id,
        role,
      },
    });

    if (error) {
      return { ok: false, error: error.message || 'Failed to register user' };
    }

    if (data?.error) {
      return { ok: false, error: data.error };
    }

    return {
      ok: true,
      data: {
        userId: data.user_id,
        email: data.email,
        companyId: data.company_id,
        role: data.role,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// --- User Profile Updates ---

/**
 * Update a user's full name and/or role via RPC
 * Available to admin (any user) and client_admin (same company only)
 */
export async function updateCompanyUser(
  userId: string,
  fullName: string,
  role: 'client_admin' | 'client_user'
): Promise<ClientOperationResult<UpdateUserResponse>> {
  try {
    // Call the update RPC
    const { error } = await supabase.rpc('update_user_profile_admin', {
      p_user_id: userId,
      p_full_name: fullName,
      p_role: role,
    });

    if (error) {
      // Map Postgres error codes to friendly messages
      if (error.code === '42501') {
        return { ok: false, error: 'Insufficient permission to update this user' };
      }
      return { ok: false, error: error.message || 'Failed to update user' };
    }

    return {
      ok: true,
      data: {
        userId,
        fullName,
        role,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// --- User Status Management ---

/**
 * Toggle a user's active status via RPC (deactivate/reactivate)
 * Available to admin (any user) and client_admin (same company only)
 */
export async function setCompanyUserActive(
  userId: string,
  isActive: boolean
): Promise<ClientOperationResult<void>> {
  try {
    const { error } = await supabase.rpc('toggle_user_active_admin', {
      p_user_id: userId,
      p_is_active: isActive,
    });

    if (error) {
      // Map Postgres error codes to friendly messages
      if (error.code === '42501') {
        return { ok: false, error: 'Insufficient permission to modify this user' };
      }
      if (error.message?.includes('Admin users cannot be deactivated')) {
        return { ok: false, error: 'Admin users cannot be deactivated' };
      }
      return { ok: false, error: error.message || 'Failed to update user status' };
    }

    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// --- User Access Recovery ---

/**
 * Resend invitation email to a user
 * Re-issues the initial OTP / magic-link email
 */
export async function resendCompanyUserInvite(
  userId: string
): Promise<ClientOperationResult<void>> {
  try {
    const { data, error } = await supabase.functions.invoke('resend-user-invite', {
      body: { user_id: userId },
    });

    if (error) {
      return { ok: false, error: error.message || 'Failed to resend invite' };
    }

    if (data?.error) {
      return { ok: false, error: data.error };
    }

    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Reset a user's access by deactivating and reactivating them
 * Forces a fresh OTP, effectively revoking existing sessions
 */
export async function resetCompanyUserAccess(
  userId: string
): Promise<ClientOperationResult<void>> {
  try {
    // First deactivate
    const { error: deactivateError } = await supabase.rpc('toggle_user_active_admin', {
      p_user_id: userId,
      p_is_active: false,
    });

    if (deactivateError) {
      return { ok: false, error: deactivateError.message || 'Failed to reset access' };
    }

    // Then reactivate (which forces new OTP)
    const { error: reactivateError } = await supabase.rpc('toggle_user_active_admin', {
      p_user_id: userId,
      p_is_active: true,
    });

    if (reactivateError) {
      return { ok: false, error: reactivateError.message || 'Failed to reset access' };
    }

    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// --- Slot Request Management ---

/**
 * Cancel a pending slot request
 * Available to the original requester OR admin
 */
export async function cancelSlotRequest(
  requestId: string
): Promise<ClientOperationResult<void>> {
  try {
    const { error } = await supabase.rpc('cancel_slot_request', {
      p_request_id: requestId,
    });

    if (error) {
      // Map Postgres error codes to friendly messages
      if (error.code === '42501') {
        return { ok: false, error: 'You do not have permission to cancel this request' };
      }
      if (error.message?.includes('already processed')) {
        return { ok: false, error: 'This request has already been processed' };
      }
      return { ok: false, error: error.message || 'Failed to cancel slot request' };
    }

    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Submit a new slot request for the current company
 * Inserts a pending request that will be reviewed by admin
 */
export async function requestCompanySlots(
  requestedSlots: number
): Promise<ClientOperationResult<{ requestId: string }>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: 'Not authenticated' };
    }

    // Get caller profile to extract company_id
    const { data: callerProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !callerProfile) {
      return { ok: false, error: 'Failed to load user profile' };
    }

    // Check if a pending request already exists
    const { data: existingRequests, error: existingError } = await supabase
      .from('slot_requests')
      .select('id')
      .eq('company_id', callerProfile.company_id)
      .eq('status', 'pending')
      .limit(1);

    if (existingError) {
      return { ok: false, error: 'Failed to check existing requests' };
    }

    if (existingRequests && existingRequests.length > 0) {
      return { ok: false, error: 'You already have a pending slot request' };
    }

    // Insert new slot request
    const { data, error } = await supabase
      .from('slot_requests')
      .insert({
        company_id: callerProfile.company_id,
        requested_by: user.id,
        requested_slots: requestedSlots,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      return { ok: false, error: error.message || 'Failed to submit slot request' };
    }

    return {
      ok: true,
      data: {
        requestId: data.id,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Fetch the latest pending slot request for the current company
 * Returns null if no pending request exists
 */
export async function getCompanyPendingSlotRequest(): Promise<
  ClientOperationResult<{ id: string; requestedSlots: number } | null>
> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: 'Not authenticated' };
    }

    // Get caller profile
    const { data: callerProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !callerProfile) {
      return { ok: false, error: 'Failed to load user profile' };
    }

    // Fetch pending request
    const { data, error } = await supabase
      .from('slot_requests')
      .select('id, requested_slots')
      .eq('company_id', callerProfile.company_id)
      .eq('status', 'pending')
      .maybeSingle();

    if (error) {
      return { ok: false, error: error.message || 'Failed to fetch slot request' };
    }

    return {
      ok: true,
      data: data ? { id: data.id, requestedSlots: data.requested_slots } : null,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
