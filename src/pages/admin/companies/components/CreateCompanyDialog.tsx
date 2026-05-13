import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (params: {
    name: string;
    country: string;
    insuranceType: 'motor' | 'medical';
    maxUserSlots: number;
  }) => Promise<void>;
}

export function CreateCompanyDialog({ open, onOpenChange, onSubmit }: CreateCompanyDialogProps) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [insuranceType, setInsuranceType] = useState<'motor' | 'medical'>('medical');
  const [maxUserSlots, setMaxUserSlots] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setName('');
    setCountry('');
    setInsuranceType('medical');
    setMaxUserSlots(5);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !country.trim()) {
      setError('All fields are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({ name: name.trim(), country: country.trim(), insuranceType, maxUserSlots });
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create company');
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
          <DialogTitle>Create Company</DialogTitle>
        </DialogHeader>
        <DialogDescription>Add a new client company to the platform.</DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Insurance"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. UAE"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insurance-type">Insurance Type</Label>
            <select
              id="insurance-type"
              value={insuranceType}
              onChange={(e) => setInsuranceType(e.target.value as 'motor' | 'medical')}
              className="flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
              style={{
                backgroundColor: 'var(--color-bg-input)',
                borderColor: 'var(--color-border-strong)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="medical">Medical</option>
              <option value="motor">Motor</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-slots">Max User Slots</Label>
            <Input
              id="max-slots"
              type="number"
              min={1}
              max={100}
              value={maxUserSlots}
              onChange={(e) => setMaxUserSlots(parseInt(e.target.value) || 1)}
            />
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
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
