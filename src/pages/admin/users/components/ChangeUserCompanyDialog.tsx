import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { AdminUser, Company } from '@/lib/db/admin-operations';

interface ChangeUserCompanyDialogProps {
  user: AdminUser | null;
  companies: Company[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (companyId: string) => Promise<void>;
}

export function ChangeUserCompanyDialog({ user, companies, onOpenChange, onSubmit }: ChangeUserCompanyDialogProps) {
  const [companyId, setCompanyId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCompanyId(user?.companyId ?? '');
    setError(null);
  }, [user]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!companyId || !user) return;

    setSaving(true);
    setError(null);
    try {
      await onSubmit(companyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change company');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change company</DialogTitle>
        </DialogHeader>
        <DialogDescription>Assign {user?.fullName ?? user?.email ?? 'this user'} to a different company.</DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="change-company">Company</Label>
            <Select
              id="change-company"
              value={companyId}
              onChange={(event) => setCompanyId(event.target.value)}
              options={[
                { value: '', label: 'Select a company...' },
                ...companies.filter((company) => company.isActive).map((company) => ({ value: company.id, label: company.name })),
              ]}
            />
          </div>
          {error && <p className="text-sm" style={{ color: 'var(--color-status-red)' }}>{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving || !companyId || companyId === user?.companyId}>Save company</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
