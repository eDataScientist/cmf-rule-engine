/**
 * M3-4.C.4 — Edit Company User Dialog
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { updateCompanyUser } from '@/lib/db/client-operations';
import { useAuth } from '@/lib/auth/context';
import type { AdminUser } from '@/lib/db/admin-operations';

interface EditCompanyUserDialogProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  disabled?: boolean;
}

export function EditCompanyUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
  disabled = false,
}: EditCompanyUserDialogProps) {
  const { profile } = useAuth();
  const [fullName, setFullName] = useState(user.fullName ?? '');
  const [role, setRole] = useState<'client_admin' | 'client_user'>(user.role as 'client_admin' | 'client_user');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Internal self-edit guard: block editing the caller's own row even if parent somehow enables it
  const isSelf = user.userId === profile?.user_id;
  const isDisabled = disabled || isSelf;

  useEffect(() => {
    if (open) {
      setFullName(user.fullName ?? '');
      setRole(user.role as 'client_admin' | 'client_user');
      setError(null);
    }
  }, [open, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isDisabled) {
      setError('This action is not available for this user.');
      return;
    }

    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await updateCompanyUser(user.userId, fullName.trim(), role);

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
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {isSelf
            ? 'You cannot edit your own account.'
            : isDisabled
              ? 'This action is not available for this user.'
              : `Editing ${user.email ?? user.fullName}`}
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input
              id="edit-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              disabled={isDisabled || submitting}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-role">Role</Label>
            <Select
              id="edit-role"
              options={[
                { value: 'client_user', label: 'Client User' },
                { value: 'client_admin', label: 'Client Admin' },
              ]}
              value={role}
              onChange={(e) => setRole(e.target.value as 'client_admin' | 'client_user')}
              disabled={isDisabled || submitting}
            />
          </div>

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
            <Button type="submit" disabled={isDisabled || submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
