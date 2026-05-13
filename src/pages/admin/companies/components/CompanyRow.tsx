import { Button } from '@/components/ui/button';
import { Power, Loader2 } from 'lucide-react';
import type { Company } from '@/lib/db/admin-operations';

interface CompanyRowProps {
  company: Company;
  onToggleActive: (company: Company) => void;
  toggling: boolean;
}

export function CompanyRow({ company, onToggleActive, toggling }: CompanyRowProps) {
  return (
    <tr className="border-b last:border-0" style={{ borderColor: 'var(--color-border-subtle)' }}>
      <td className="px-4 py-3">
        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {company.name}
        </span>
      </td>
      <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
        {company.country}
      </td>
      <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
        {company.insuranceType}
      </td>
      <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
        {company.maxUserSlots}
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: company.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: company.isActive ? 'var(--color-status-green)' : 'var(--color-status-red)',
          }}
        >
          {company.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onToggleActive(company)}
          disabled={toggling}
          title={company.isActive ? 'Deactivate' : 'Reactivate'}
        >
          {toggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Power
              className="h-4 w-4"
              style={{ color: company.isActive ? 'var(--color-status-red)' : 'var(--color-status-green)' }}
            />
          )}
        </Button>
      </td>
    </tr>
  );
}
