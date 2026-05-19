/**
 * M3-4.0.4 — Shared client-route test fixtures
 *
 * Exports UserProfile fixtures for client_admin and client_user roles,
 * including inactive and cross-company variants.
 *
 * Shape matches UserProfile from src/lib/auth/context.tsx.
 */

import type { UserProfile } from '@/lib/auth/context';

/** Company IDs used across fixtures. COMPANY_A is the primary company. */
export const COMPANY_A_ID = 'company-a-fixture-id';
export const COMPANY_B_ID = 'company-b-fixture-id';

/**
 * Active client_admin in Company A.
 * Used for happy-path tests where client_admin has full access.
 */
export const clientAdminProfile: UserProfile = {
  user_id: 'user-client-admin-1',
  role: 'client_admin',
  company_id: COMPANY_A_ID,
  full_name: 'Alice Admin',
  is_active: true,
};

/**
 * Inactive client_admin in Company A.
 * Used to verify that deactivated accounts are signed out and blocked.
 */
export const clientAdminInactiveProfile: UserProfile = {
  user_id: 'user-client-admin-inactive',
  role: 'client_admin',
  company_id: COMPANY_A_ID,
  full_name: 'Bob Blocked',
  is_active: false,
};

/**
 * Active client_user in Company A.
 * Used to verify read-only enforcement and redirect behaviour.
 */
export const clientUserProfile: UserProfile = {
  user_id: 'user-client-user-1',
  role: 'client_user',
  company_id: COMPANY_A_ID,
  full_name: 'Charlie User',
  is_active: true,
};

/**
 * Active client_admin in Company B (a different company from Company A).
 * Used to verify that cross-company operations are rejected at every layer.
 */
export const clientAdminCrossCompanyProfile: UserProfile = {
  user_id: 'user-client-admin-cross',
  role: 'client_admin',
  company_id: COMPANY_B_ID,
  full_name: 'Dana Cross',
  is_active: true,
};
