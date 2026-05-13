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
import { Loader2 } from 'lucide-react';
import type { Company } from '@/lib/db/admin-operations';

interface RegisterUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies: Company[];
  onSubmit: (params: {
    email: string;
    fullName: string;
    companyId: string;
    role: 'client_admin' | 'client_user';
  }) => Promise<void>;
}

export function RegisterUserDialog({ open, onOpenChange, companies, onSubmit }: RegisterUserDialogProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [role, setRole] = useState<'client_admin' | 'client_user'>('client_user');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCompanies = companies.filter((c) => c.isActive);

  function resetForm() {
    setEmail('');
    setFullName('');
    setCompanyId('');
    setRole('client_user');
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !fullName.trim() || !companyId) {
      setError('All fields are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        email: email.trim(),
        fullName: fullName.trim(),
        companyId,
        role,
      });
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register user');
    } finally {
      setSubmitting(false);
    }
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
        <DialogDescription>Create a new user account under a company. They will receive an OTP to sign in.</DialogDescription>

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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-name">Full Name</Label>
            <Input
              id="reg-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-company">Company</Label>
            <select
              id="reg-company"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
              style={{
                backgroundColor: 'var(--color-bg-input)',
                borderColor: 'var(--color-border-strong)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="">Select a company...</option>
              {activeCompanies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-role">Role</Label>
            <select
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'client_admin' | 'client_user')}
              className="flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
              style={{
                backgroundColor: 'var(--color-bg-input)',
                borderColor: 'var(--color-border-strong)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="client_user">Client User</option>
              <option value="client_admin">Client Admin</option>
            </select>
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--color-status-red)' }}>{error}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
