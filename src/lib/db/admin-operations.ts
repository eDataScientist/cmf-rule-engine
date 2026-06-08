import { supabase } from './supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseRow = any;

// --- Types ---

export interface Company {
  id: string;
  name: string;
  country: string;
  insuranceType: 'motor' | 'medical';
  maxUserSlots: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string | null;
}

export interface AdminUser {
  userId: string;
  fullName: string | null;
  email: string | null;
  role: 'admin' | 'client_admin' | 'client_user';
  companyId: string | null;
  companyName: string | null;
  isActive: boolean;
  createdAt: string;
  lastSignIn: string | null;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AdminDashboardCounts {
  companies: number;
  users: number;
  datasets: number;
  trees: number;
}

export interface SlotRequest {
  id: string;
  companyId: string;
  companyName: string | null;
  requestedBy: string;
  requestedByName: string | null;
  requestedSlots: number;
  status: 'pending' | 'approved' | 'denied';
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogFilters {
  action?: string;
  userId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// --- Dashboard ---

export async function getAdminDashboardCounts(): Promise<AdminDashboardCounts> {
  const [companies, users, datasets, trees] = await Promise.all([
    supabase.from('companies').select('id', { count: 'exact', head: true }),
    supabase.from('user_profiles').select('user_id', { count: 'exact', head: true }),
    supabase.from('datasets').select('id', { count: 'exact', head: true }),
    supabase.from('trees').select('id', { count: 'exact', head: true }),
  ]);

  return {
    companies: companies.count ?? 0,
    users: users.count ?? 0,
    datasets: datasets.count ?? 0,
    trees: trees.count ?? 0,
  };
}

// --- Activity Log ---

export async function getRecentActivity(limit = 20): Promise<ActivityLogEntry[]> {
  const { data, error } = await supabase
    .from('admin_activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch activity log: ${error.message}`);
  }

  return enrichActivityEntries((data as SupabaseRow[]).map(rowToActivityLog));
}

export async function getActivityLog(
  filters: ActivityLogFilters = {},
  limit = 50,
  offset = 0
): Promise<{ entries: ActivityLogEntry[]; total: number }> {
  let query = supabase
    .from('admin_activity_log')
    .select('*', { count: 'exact' });

  if (filters.action) {
    query = query.eq('action', filters.action);
  }
  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.search) {
    query = query.or(`action.ilike.%${filters.search}%,target_type.ilike.%${filters.search}%`);
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch activity log: ${error.message}`);
  }

  return {
    entries: await enrichActivityEntries((data as SupabaseRow[]).map(rowToActivityLog)),
    total: count ?? 0,
  };
}

function rowToActivityLog(row: SupabaseRow): ActivityLogEntry {
  return {
    id: row.id,
    userId: row.user_id,
    userName: null,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    details: row.details,
    ipAddress: row.ip_address,
    createdAt: row.created_at,
  };
}

async function enrichActivityEntries(entries: ActivityLogEntry[]): Promise<ActivityLogEntry[]> {
  if (entries.length === 0) {
    return entries;
  }

  const userIds = Array.from(
    new Set(entries.map((entry) => entry.userId).filter((id): id is string => typeof id === 'string' && id.length > 0))
  );

  if (userIds.length === 0) {
    return entries;
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, full_name')
    .in('user_id', userIds);

  if (error) {
    throw new Error(`Failed to resolve activity users: ${error.message}`);
  }

  const userNameById = new Map<string, string | null>();
  for (const row of data as SupabaseRow[]) {
    userNameById.set(row.user_id, row.full_name ?? null);
  }

  return entries.map((entry) => ({
    ...entry,
    userName: userNameById.get(entry.userId) ?? null,
  }));
}

// --- Companies ---

export async function getCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch companies: ${error.message}`);
  }

  return (data as SupabaseRow[]).map(rowToCompany);
}

export async function getCompany(id: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch company: ${error.message}`);
  }

  return data ? rowToCompany(data) : null;
}

export async function createCompany(params: {
  name: string;
  country: string;
  insuranceType: 'motor' | 'medical';
  maxUserSlots: number;
}): Promise<Company> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('companies')
    .insert({
      name: params.name,
      country: params.country,
      insurance_type: params.insuranceType,
      max_user_slots: params.maxUserSlots,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create company: ${error.message}`);
  }

  await logAdminAction('create_company', 'company', data.id, {
    company_name: params.name,
  });

  return rowToCompany(data);
}

export async function updateCompany(
  id: string,
  updates: Partial<{
    name: string;
    country: string;
    insuranceType: 'motor' | 'medical';
    maxUserSlots: number;
    isActive: boolean;
  }>
): Promise<Company> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.country !== undefined) dbUpdates.country = updates.country;
  if (updates.insuranceType !== undefined) dbUpdates.insurance_type = updates.insuranceType;
  if (updates.maxUserSlots !== undefined) dbUpdates.max_user_slots = updates.maxUserSlots;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('companies')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update company: ${error.message}`);
  }

  await logAdminAction('update_company', 'company', id, updates);

  return rowToCompany(data);
}

/** Deactivate a company via Edge Function (revokes sessions, deactivates users). */
export async function deactivateCompany(companyId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('deactivate-company', {
    body: { company_id: companyId },
  });

  if (error) {
    throw new Error(error.message || 'Failed to deactivate company');
  }

  if (data?.error) {
    throw new Error(data.error);
  }
}

/** Reactivate a company (direct update - no session revocation needed). */
export async function reactivateCompany(companyId: string): Promise<void> {
  const { error } = await supabase
    .from('companies')
    .update({ is_active: true })
    .eq('id', companyId);

  if (error) {
    throw new Error(`Failed to reactivate company: ${error.message}`);
  }

  await logAdminAction('reactivate_company', 'company', companyId, {});
}

function rowToCompany(row: SupabaseRow): Company {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    insuranceType: row.insurance_type,
    maxUserSlots: row.max_user_slots,
    isActive: row.is_active,
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

// --- Users ---

export async function getAdminUsers(): Promise<AdminUser[]> {
  // Try the SECURITY DEFINER function first (includes emails from auth.users)
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_user_list');

  if (!rpcError && rpcData) {
    return (rpcData as SupabaseRow[]).map((row) => ({
      userId: row.user_id,
      fullName: row.full_name,
      email: row.email ?? null,
      role: row.role,
      companyId: row.company_id,
      companyName: row.company_name ?? null,
      isActive: row.is_active,
      createdAt: row.created_at,
      lastSignIn: row.last_sign_in_at ?? null,
    }));
  }

  // Fallback: direct query without emails (RPC function not yet deployed)
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, full_name, role, company_id, is_active, created_at, companies(name)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return (data as SupabaseRow[]).map((row) => ({
    userId: row.user_id,
    fullName: row.full_name,
    email: null,
    role: row.role,
    companyId: row.company_id,
    companyName: row.companies?.name ?? null,
    isActive: row.is_active,
    createdAt: row.created_at,
    lastSignIn: null,
  }));
}

export async function getCompanyUsers(companyId: string): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      user_id,
      email,
      full_name,
      role,
      company_id,
      is_active,
      created_at,
      companies (name)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch company users: ${error.message}`);
  }

  return (data as SupabaseRow[]).map((row) => ({
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email ?? null,
    role: row.role,
    companyId: row.company_id,
    companyName: row.companies?.name ?? null,
    isActive: row.is_active,
    createdAt: row.created_at,
    lastSignIn: null,
  }));
}

/** Toggle user active status with audit logging. */
export async function toggleUserActive(userId: string, currentlyActive: boolean): Promise<void> {
  const newActive = !currentlyActive;

  const { error } = await supabase.rpc('toggle_user_active_admin', {
    p_user_id: userId,
    p_is_active: newActive,
  });

  if (error) {
    throw new Error(`Failed to toggle user status: ${error.message}`);
  }
  // Audit logging is handled by the toggle_user_active_admin RPC directly.
}

/** Update user profile fields (role, company, name) with audit logging. */
export async function updateUser(
  userId: string,
  updates: Partial<{
    fullName: string;
    role: 'client_admin' | 'client_user';
    companyId: string;
  }>
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
  if (updates.role !== undefined) dbUpdates.role = updates.role;
  if (updates.companyId !== undefined) dbUpdates.company_id = updates.companyId;

  const { error } = await supabase
    .from('user_profiles')
    .update(dbUpdates)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  await logAdminAction('edit_user', 'user', userId, updates as Record<string, unknown>);
}

/** Resend invitation email to a user. */
export async function resendUserInvite(userId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('resend-user-invite', {
    body: { user_id: userId },
  });

  if (error) {
    throw new Error(error.message || 'Failed to resend user invite');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  await logAdminAction('resend_user_invite', 'user', userId, {});
}

/** Reset user access and send recovery email. */
export async function resetUserAccess(userId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('reset-user-access', {
    body: { user_id: userId },
  });

  if (error) {
    throw new Error(error.message || 'Failed to reset user access');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  await logAdminAction('reset_user_access', 'user', userId, {});
}

// --- Slot Requests ---

export async function getPendingSlotRequests(): Promise<SlotRequest[]> {
  // Fetch slot requests with company names
  const { data, error } = await supabase
    .from('slot_requests')
    .select(`
      *,
      companies (name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch slot requests: ${error.message}`);
  }

  const rows = data as SupabaseRow[];

  // Resolve requester names separately since requested_by FK goes to auth.users, not user_profiles
  const requesterIds = rows
    .map((r) => r.requested_by)
    .filter((id): id is string => typeof id === 'string');

  let requesterNames: Record<string, string> = {};
  if (requesterIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, full_name')
      .in('user_id', requesterIds);

    if (profilesError) {
      throw new Error(`Failed to resolve slot request users: ${profilesError.message}`);
    }

    if (profiles) {
      requesterNames = Object.fromEntries(
        (profiles as SupabaseRow[]).map((p) => [p.user_id, p.full_name])
      );
    }
  }

  return rows.map((row) => ({
    id: row.id,
    companyId: row.company_id,
    companyName: row.companies?.name ?? null,
    requestedBy: row.requested_by,
    requestedByName: requesterNames[row.requested_by] ?? null,
    requestedSlots: row.requested_slots,
    status: row.status,
    reviewedBy: row.reviewed_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function approveSlotRequest(requestId: string): Promise<void> {
  const { error } = await supabase.rpc('approve_slot_request_admin', {
    p_request_id: requestId,
  });

  if (error) {
    throw new Error(`Failed to approve slot request: ${error.message}`);
  }
}

export async function denySlotRequest(requestId: string): Promise<void> {
  const { error } = await supabase.rpc('deny_slot_request_admin', {
    p_request_id: requestId,
  });

  if (error) {
    throw new Error(`Failed to deny slot request: ${error.message}`);
  }
}

// --- Helpers ---

async function logAdminAction(
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, unknown>
): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Failed to resolve admin actor for activity log');
  }

  const { error } = await supabase.from('admin_activity_log').insert({
    user_id: user.id,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
  });

  if (error) {
    throw new Error(`Failed to log admin action: ${error.message}`);
  }
}
