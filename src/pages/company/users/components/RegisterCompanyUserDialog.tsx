/**
 * M3-4.C.3 — Register Company User Dialog
 */

import { useState } from 'react';
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
import { registerCompanyUser } from '@/lib/db/client-operations';

interface RegisterCompanyUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  currentCount: number;
  maxCount: number;
}

export function RegisterCompanyUserDialog({
  open,
  onOpenChange,
  onSuccess,
  currentCount,
  maxCount,
}: RegisterCompanyUserDialogProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'client_admin' | 'client_user'>('client_user');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableSlots = maxCount - currentCount;
  const atCapacity = availableSlots <= 0;

  function resetForm() {
    setEmail('');
    setFullName('');
    setRole('client_user');
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (atCapacity) {
      setError('Company is at slot capacity');
      return;
    }

    if (!email.trim() || !fullName.trim()) {
      setError('All fields are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await registerCompanyUser(email.trim(), fullName.trim(), role);

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    resetForm();
    onOpenChange(false);
    onSuccess();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register User</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {atCapacity
            ? 'Company is at slot capacity. No more users can be added.'
            : `Available slots: ${availableSlots} of ${maxCount}`}
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@company.com"
              autoFocus
              disabled={atCapacity || submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-name">Full Name</Label>
            <Input
              id="reg-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              disabled={atCapacity || submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-role">Role</Label>
            <Select
              id="reg-role"
              options={[
                { value: 'client_user', label: 'Client User' },
                { value: 'client_admin', label: 'Client Admin' },
              ]}
              value={role}
              onChange={(e) => setRole(e.target.value as 'client_admin' | 'client_user')}
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
            <Button type="submit" disabled={submitting || atCapacity}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}