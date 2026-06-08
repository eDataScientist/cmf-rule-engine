/**
 * M3-4.C.5 — User Status Confirm Dialog (shared for deactivate/reactivate)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { setCompanyUserActive } from '@/lib/db/client-operations';
import { useAuth } from '@/lib/auth/context';
import type { AdminUser } from '@/lib/db/admin-operations';

interface UserStatusConfirmDialogProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  disabled?: boolean;
}

export function UserStatusConfirmDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
  disabled = false,
}: UserStatusConfirmDialogProps) {
  const { profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetStatus = !user.isActive;
  const actionLabel = targetStatus ? 'Reactivate' : 'Deactivate';

  // Internal self-deactivation guard
  const isSelf = user.userId === profile?.user_id;
  const isDisabled = disabled || isSelf;

  async function handleConfirm() {
    if (isDisabled) {
      setError('This action is not available for this user.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await setCompanyUserActive(user.userId, targetStatus);

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    onOpenChange(false);
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {actionLabel} User
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {isSelf
            ? 'You cannot deactivate your own account.'
            : `Are you sure you want to ${actionLabel.toLowerCase()} ${user.fullName ?? user.email}?${targetStatus ? ' This will allow them to sign in.' : ' This will prevent them from signing in.'}`}
        </DialogDescription>

        {error && (
          <p className="text-sm" style={{ color: 'var(--color-status-red)' }}>
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDisabled || submitting}
            variant={targetStatus ? 'default' : 'destructive'}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
