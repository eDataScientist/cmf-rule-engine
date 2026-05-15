import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Company } from "@/lib/db/admin-operations";

interface EditCompanyDialogProps {
  open: boolean;
  company: Company;
  onOpenChange: (open: boolean) => void;
  onSubmit: (params: {
    id: string;
    name: string;
    country: string;
    insuranceType: "motor" | "medical";
    maxUserSlots: number;
  }) => Promise<void>;
}

export function EditCompanyDialog({
  open,
  company,
  onOpenChange,
  onSubmit,
}: EditCompanyDialogProps) {
  const [name, setName] = useState(company.name);
  const [country, setCountry] = useState(company.country);
  const [insuranceType, setInsuranceType] = useState<"motor" | "medical">(
    company.insuranceType
  );
  const [maxUserSlots, setMaxUserSlots] = useState<string>(String(company.maxUserSlots));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(company.name);
      setCountry(company.country);
      setInsuranceType(company.insuranceType);
      setMaxUserSlots(String(company.maxUserSlots));
      setError(null);
    }
  }, [open, company]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !country.trim()) {
      setError("All fields are required");
      return;
    }

    const slots = parseInt(maxUserSlots, 10);
    if (isNaN(slots) || slots < 1 || slots > 100) {
      setError("Max user slots must be between 1 and 100");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        id: company.id,
        name: name.trim(),
        country: country.trim(),
        insuranceType,
        maxUserSlots: slots,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update company");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
        </DialogHeader>
        <DialogDescription>Update company details.</DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-company-name">Company Name</Label>
            <Input
              id="edit-company-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Insurance"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-country">Country</Label>
            <Input
              id="edit-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. UAE"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-insurance-type">Insurance Type</Label>
            <select
              id="edit-insurance-type"
              value={insuranceType}
              onChange={(e) =>
                setInsuranceType(e.target.value as "motor" | "medical")
              }
              className="flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
              style={{
                backgroundColor: "var(--color-bg-input)",
                borderColor: "var(--color-border-strong)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value="medical">Medical</option>
              <option value="motor">Motor</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-max-slots">Max User Slots</Label>
            <Input
              id="edit-max-slots"
              type="number"
              min={1}
              max={100}
              value={maxUserSlots}
              onChange={(e) => setMaxUserSlots(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--color-status-red)" }}>
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
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
