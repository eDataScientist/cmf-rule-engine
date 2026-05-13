/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '@/lib/auth/context';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function getRoleLandingPath(role: UserRole) {
  return role === 'admin' ? '/admin' : '/datasets';
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const location = useLocation();
  const { user, profile, loading, signOut } = useAuth();
  const hasTriggeredSignOutRef = useRef(false);

  const isInvalidAccount = !loading && Boolean(user) && (!profile || !profile.is_active);

  useEffect(() => {
    if (!isInvalidAccount) {
      hasTriggeredSignOutRef.current = false;
      return;
    }

    if (hasTriggeredSignOutRef.current) {
      return;
    }

    hasTriggeredSignOutRef.current = true;

    void signOut();
  }, [isInvalidAccount, signOut]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (isInvalidAccount) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ message: 'Your account is deactivated or not provisioned. Contact your administrator.' }}
      />
    );
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to={getRoleLandingPath(profile.role)} replace />;
  }

  return <>{children}</>;
}
