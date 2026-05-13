import { useCallback, useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import {
  Users,
  Search,
  Loader2,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { headerBreadcrumbsAtom } from '@/store/atoms/header';
import { useAuth } from '@/lib/auth/context';
import { getCompanyUsers, type AdminUser } from '@/lib/db/admin-operations';
import { supabase } from '@/lib/db/supabase';

interface SlotRequest {
  id: string;
  requestedSlots: number;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
}

export default function CompanyUsers() {
  const { profile } = useAuth();
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [maxSlots, setMaxSlots] = useState<number>(0);
  const [slotRequests, setSlotRequests] = useState<SlotRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Slot request dialog state
  const [requestSlotsOpen, setRequestSlotsOpen] = useState(false);
  const [requestingSlots, setRequestingSlots] = useState(false);
  const [newSlotCount, setNewSlotCount] = useState(5);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  useEffect(() => {
    setBreadcrumbs([{ label: 'My Company', href: '/company/users' }]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  const loadCompanyData = useCallback(async () => {
    if (!profile?.company_id) return;

    setLoading(true);
    setError(null);

    try {
      const [companyRes, usersData, requestsRes] = await Promise.all([
        supabase
          .from('companies')
          .select('name, max_user_slots')
          .eq('id', profile.company_id)
          .single(),
        getCompanyUsers(profile.company_id),
        supabase
          .from('slot_requests')
          .select('id, requested_slots, status, created_at')
          .eq('company_id', profile.company_id)
          .order('created_at', { ascending: false }),
      ]);

      if (companyRes.data) {
        setCompanyName(companyRes.data.name);
        setMaxSlots(companyRes.data.max_user_slots);
      }

      setUsers(usersData);

      setSlotRequests(
        (requestsRes.data ?? []).map((r) => ({
          id: r.id,
          requestedSlots: r.requested_slots,
          status: r.status,
          createdAt: r.created_at,
        }))
      );
    } catch (err) {
      console.error('Failed to load company data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load company data');
    } finally {
      setLoading(false);
    }
  }, [profile?.company_id]);

  useEffect(() => {
    if (profile?.company_id) {
      void loadCompanyData();
    }
  }, [profile?.company_id, loadCompanyData]);

  async function handleRequestSlots() {
    if (!profile?.company_id || !profile?.user_id) return;

    // Validate slot count is a positive integer
    const slotCount = Math.floor(newSlotCount);
    if (!Number.isFinite(slotCount) || slotCount < 1) {
      setRequestError('Please enter a valid number of slots (1 or more).');
      return;
    }

    // Check for existing pending request
    const hasPending = slotRequests.some((r) => r.status === 'pending');
    if (hasPending) {
      setRequestError('You already have a pending slot request. Please wait for it to be reviewed.');
      return;
    }

    setRequestingSlots(true);
    setRequestError(null);

    try {
      const { error: insertError } = await supabase.from('slot_requests').insert({
        company_id: profile.company_id,
        requested_by: profile.user_id,
        requested_slots: slotCount,
        status: 'pending',
      });

      if (insertError) throw insertError;

      setRequestSuccess(`Successfully requested ${slotCount} additional slot${slotCount > 1 ? 's' : ''}.`);
      await loadCompanyData();

      // Close dialog after a brief delay so the user sees the success message
      setTimeout(() => {
        setRequestSlotsOpen(false);
        setRequestSuccess(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to request slots:', err);
      setRequestError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setRequestingSlots(false);
    }
  }

  function handleOpenRequestDialog() {
    setNewSlotCount(5);
    setRequestError(null);
    setRequestSuccess(null);
    setRequestSlotsOpen(true);
  }

  const filtered = search.trim()
    ? users.filter(
        (u) =>
          (u.fullName ?? '').toLowerCase().includes(search.toLowerCase()) ||
          (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
          u.role.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const currentUserCount = users.length;
  const availableSlots = maxSlots - currentUserCount;

  const roleLabel: Record<string, string> = {
    client_admin: 'Client Admin',
    client_user: 'Client User',
  };

  const statusIcon = (status: SlotRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" style={{ color: 'var(--color-status-yellow, #ca8a04)' }} />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" style={{ color: 'var(--color-status-green)' }} />;
      case 'denied':
        return <XCircle className="h-4 w-4" style={{ color: 'var(--color-status-red)' }} />;
    }
  };

  // --- Error state ---
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            My Company
          </h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-10 w-10 mb-3" style={{ color: 'var(--color-status-red)' }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Failed to load company data
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
              {error}
            </p>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => void loadCompanyData()}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            My Company
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Manage users and request additional slots for {companyName ?? 'your company'}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Total Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {loading ? '—' : maxSlots}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {loading ? '—' : currentUserCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold"
              style={{ color: loading ? 'var(--color-text-primary)' : availableSlots > 0 ? 'var(--color-status-green)' : 'var(--color-status-red)' }}
            >
              {loading ? '—' : availableSlots}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slot Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base" style={{ color: 'var(--color-text-primary)' }}>
            Slot Requests
          </CardTitle>
          <Button size="sm" className="gap-2" onClick={handleOpenRequestDialog}>
            <Plus className="h-4 w-4" />
            Request More Slots
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          ) : slotRequests.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
              No slot requests yet
            </p>
          ) : (
            <div className="space-y-2">
              {slotRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                >
                  <div className="flex items-center gap-3">
                    {statusIcon(req.status)}
                    <div>
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {req.requestedSlots} slot{req.requestedSlots > 1 ? 's' : ''}
                      </span>
                      <span
                        className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                        style={{
                          backgroundColor:
                            req.status === 'pending'
                              ? 'var(--color-status-yellow-bg, rgba(234, 179, 8, 0.1))'
                              : req.status === 'approved'
                              ? 'var(--color-status-green-bg, rgba(34, 197, 94, 0.1))'
                              : 'var(--color-status-red-bg, rgba(239, 68, 68, 0.1))',
                          color:
                            req.status === 'pending'
                              ? 'var(--color-status-yellow, #ca8a04)'
                              : req.status === 'approved'
                              ? 'var(--color-status-green)'
                              : 'var(--color-status-red)',
                        }}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Company Users
        </h2>
      </div>

      <div className="relative max-w-sm">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: 'var(--color-text-muted)' }}
        />
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
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Added
                  </th>
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
                          backgroundColor:
                            user.role === 'client_admin'
                              ? 'var(--color-brand-blue-bg, rgba(37, 99, 235, 0.1))'
                              : 'var(--color-muted-bg, rgba(161, 161, 170, 0.1))',
                          color:
                            user.role === 'client_admin'
                              ? 'var(--color-brand-blue)'
                              : 'var(--color-text-secondary)',
                        }}
                      >
                        {roleLabel[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: user.isActive
                            ? 'var(--color-status-green-bg, rgba(34, 197, 94, 0.1))'
                            : 'var(--color-status-red-bg, rgba(239, 68, 68, 0.1))',
                          color: user.isActive ? 'var(--color-status-green)' : 'var(--color-status-red)',
                        }}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Request Slots Dialog */}
      <Dialog
        open={requestSlotsOpen}
        onOpenChange={(val) => {
          if (!val) {
            setRequestError(null);
            setRequestSuccess(null);
          }
          setRequestSlotsOpen(val);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Additional Slots</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Current capacity: {currentUserCount} of {maxSlots} slots used
          </DialogDescription>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slot-count">Number of additional slots</Label>
              <Input
                id="slot-count"
                type="number"
                min={1}
                max={50}
                step={1}
                value={newSlotCount}
                onChange={(e) => setNewSlotCount(parseInt(e.target.value) || 1)}
              />
            </div>

            {requestError && (
              <p className="text-sm" style={{ color: 'var(--color-status-red)' }}>
                {requestError}
              </p>
            )}

            {requestSuccess && (
              <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-status-green)' }}>
                <CheckCircle className="h-4 w-4" />
                {requestSuccess}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRequestSlotsOpen(false)}
              disabled={requestingSlots}
            >
              Cancel
            </Button>
            <Button onClick={handleRequestSlots} disabled={requestingSlots || !!requestSuccess}>
              {requestingSlots ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
