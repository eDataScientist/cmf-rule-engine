import { useEffect, useState, useMemo } from 'react';
import { useSetAtom } from 'jotai';
import {
  Users,
  UserPlus,
  Search,
  Loader2,
  Power,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { headerBreadcrumbsAtom } from '@/store/atoms/header';
import {
  getAdminUsers,
  getCompanies,
  toggleUserActive,
  updateUser,
  type AdminUser,
  type Company,
} from '@/lib/db/admin-operations';
import { supabase } from '@/lib/db/supabase';
import { RegisterUserDialog } from './components/RegisterUserDialog';
import { ChangeUserCompanyDialog } from './components/ChangeUserCompanyDialog';

export default function AdminUsers() {
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [companyUser, setCompanyUser] = useState<AdminUser | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Admin', href: '/admin' },
      { label: 'Users', href: '/admin/users' },
    ]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [usersData, companiesData] = await Promise.all([
        getAdminUsers(),
        getCompanies(),
      ]);
      setUsers(usersData);
      setCompanies(companiesData);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(params: {
    email: string;
    fullName: string;
    companyId: string;
    role: 'client_admin' | 'client_user';
  }) {
    const { data, error } = await supabase.functions.invoke('register-user', {
      body: {
        email: params.email,
        full_name: params.fullName,
        company_id: params.companyId,
        role: params.role,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to register user');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    await loadData();
    setRegisterOpen(false);
  }

  async function handleToggleActive(user: AdminUser) {
    setTogglingId(user.userId);
    try {
      await toggleUserActive(user.userId, user.isActive);
      await loadData();
    } catch (err) {
      console.error('Failed to toggle user:', err);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleChangeCompany(companyId: string) {
    if (!companyUser) return;
    await updateUser(companyUser.userId, { companyId });
    await loadData();
    setCompanyUser(null);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.fullName ?? '').toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q) ||
        (u.companyName ?? '').toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  const roleLabel: Record<string, string> = {
    admin: 'Admin',
    client_admin: 'Client Admin',
    client_user: 'Client User',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Users
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Manage platform users across all companies
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setRegisterOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Register User
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-10 w-10 mb-3" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {search ? 'No users match your search' : 'No users yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Name</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Role</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Company</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Status</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.userId}
                    className="border-b last:border-0"
                    style={{ borderColor: 'var(--color-border-subtle)' }}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {user.fullName ?? 'Unnamed'}
                        </span>
                        {user.email && (
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {user.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: user.role === 'admin'
                            ? 'rgba(37, 99, 235, 0.1)'
                            : 'rgba(161, 161, 170, 0.1)',
                          color: user.role === 'admin'
                            ? 'var(--color-brand-blue)'
                            : 'var(--color-text-secondary)',
                        }}
                      >
                        {roleLabel[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {user.companyName ?? (user.role === 'admin' ? 'Platform' : '-')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: user.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: user.isActive ? 'var(--color-status-green)' : 'var(--color-status-red)',
                        }}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.role !== 'admin' && (
                        <div className="inline-flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCompanyUser(user)}
                          >
                            Change company
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleToggleActive(user)}
                            disabled={togglingId === user.userId}
                            title={user.isActive ? 'Deactivate' : 'Reactivate'}
                          >
                            {togglingId === user.userId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Power
                                className="h-4 w-4"
                                style={{ color: user.isActive ? 'var(--color-status-red)' : 'var(--color-status-green)' }}
                              />
                            )}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <RegisterUserDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        companies={companies}
        onSubmit={handleRegister}
      />
      <ChangeUserCompanyDialog
        user={companyUser}
        companies={companies}
        onOpenChange={(open) => {
          if (!open) setCompanyUser(null);
        }}
        onSubmit={handleChangeCompany}
      />
    </div>
  );
}
