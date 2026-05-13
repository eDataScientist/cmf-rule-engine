import { useEffect, useState, useMemo } from 'react';
import { useSetAtom } from 'jotai';
import {
  Building2,
  Plus,
  Search,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { headerBreadcrumbsAtom } from '@/store/atoms/header';
import {
  getCompanies,
  createCompany,
  deactivateCompany,
  reactivateCompany,
  type Company,
} from '@/lib/db/admin-operations';
import { CreateCompanyDialog } from './components/CreateCompanyDialog';
import { CompanyRow } from './components/CompanyRow';

export default function AdminCompanies() {
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Admin', href: '/admin' },
      { label: 'Companies', href: '/admin/companies' },
    ]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(params: {
    name: string;
    country: string;
    insuranceType: 'motor' | 'medical';
    maxUserSlots: number;
  }) {
    await createCompany(params);
    await loadCompanies();
    setCreateOpen(false);
  }

  async function handleToggleActive(company: Company) {
    setTogglingId(company.id);
    try {
      if (company.isActive) {
        await deactivateCompany(company.id);
      } else {
        await reactivateCompany(company.id);
      }
      await loadCompanies();
    } catch (err) {
      console.error('Failed to toggle company:', err);
    } finally {
      setTogglingId(null);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.insuranceType.toLowerCase().includes(q)
    );
  }, [companies, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Companies
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Manage client companies and their access
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Company
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
        <Input
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-10 w-10 mb-3" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {search ? 'No companies match your search' : 'No companies yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Company</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Country</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Type</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Slots</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Status</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((company) => (
                  <CompanyRow
                    key={company.id}
                    company={company}
                    onToggleActive={handleToggleActive}
                    toggling={togglingId === company.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <CreateCompanyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
