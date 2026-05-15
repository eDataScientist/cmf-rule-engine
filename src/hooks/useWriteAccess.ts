import { useAuth, type UserRole } from '@/lib/auth/context';

export interface WriteAccessResult {
  canWrite: boolean;
  role: UserRole | null;
}

/**
 * Hook that determines write access for the current user.
 *
 * Write access is granted only to 'admin' and 'client_admin' roles.
 * 'client_user' is read-only and cannot perform mutations on trees,
 * rules, datasets, or any other restricted resources.
 *
 * This is the single source of truth for write gating across the application.
 * Use this hook instead of checking role inline to ensure consistent
 * access control and make refactoring easier.
 *
 * @returns Object with canWrite boolean and current role (or null if unauthenticated)
 */
export function useWriteAccess(): WriteAccessResult {
  const { profile } = useAuth();
  const role = profile?.role ?? null;

  const canWrite = role === 'admin' || role === 'client_admin';

  return {
    canWrite,
    role,
  };
}
