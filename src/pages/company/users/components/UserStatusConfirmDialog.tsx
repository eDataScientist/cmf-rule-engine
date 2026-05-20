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
import type { AdminUser } from '@/lib/db/admin-operations';

interface UserStatusConfirmDialogProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserStatusConfirmDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: UserStatusConfirmDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetStatus = !user.isActive;
  const actionLabel = targetStatus ? 'Reactivate' : 'Deactivate';

  async function handleConfirm() {
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
          Are you sure you want to {actionLabel.toLowerCase()} {user.fullName ?? user.email}?
          {targetStatus ? ' This will allow them to sign in.' : ' This will prevent them from signing in.'}
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
            disabled={submitting}
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