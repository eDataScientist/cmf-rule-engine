import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { headerBreadcrumbsAtom } from '@/store/atoms/header';
import { useCompanyOverview } from './hooks/useCompanyOverview';
import { RequestSlotsDialog } from './components/RequestSlotsDialog';
import { CancelSlotRequestDialog } from './components/CancelSlotRequestDialog';

const actionLabels: Record<string, string> = {
  register_user: 'Registered user',
  edit_user: 'Updated user details',
  deactivate_user: 'Deactivated user',
  reactivate_user: 'Reactivated user',
  resend_user_invite: 'Resent user invitation',
  reset_user_access: 'Reset user access',
  create_company: 'Registered company',
  update_company: 'Updated company details',
};

function formatRelativeTime(dateString: string): string {
  try {
    const elapsed = Date.now() - new Date(dateString).getTime();
    const seconds = Math.floor(elapsed / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return 'Recently';
  }
}

export default function CompanyOverview() {
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);
  const { data, loading, error, refresh } = useCompanyOverview();

  const [requestOpen, setRequestOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  useEffect(() => {
    setBreadcrumbs([{ label: 'Company Overview', href: '/company' }]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-400">
        Loading...
      </div>
    );
  }

  const { company, totalUsers, pendingRequest, activities } = data;
  const maxSlots = company?.maxUserSlots ?? 0;
  const availableSlots = maxSlots - totalUsers;

  return (
    <div className="space-y-6">
      {/* Read-Only Inactive Banner */}
      {company && !company.isActive && (
        <div className="bg-red-950/50 border border-red-800 text-red-200 px-4 py-3 rounded-md text-sm">
          Notice: This company is currently deactivated. Access is restricted to read-only.
        </div>
      )}

      {error && (
        <div className="bg-amber-950/50 border border-amber-800 text-amber-200 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="pb-2">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Slots</p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono text-zinc-50">{maxSlots}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="pb-2">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Users</p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono text-zinc-50">{totalUsers}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="pb-2">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Available Slots</p>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold font-mono ${availableSlots > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {availableSlots}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Slot Request Card */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-zinc-200">Slot Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequest ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-zinc-300">Pending Request</p>
                      <p className="text-xs text-zinc-500">{pendingRequest.requestedSlots} additional slots requested</p>
                    </div>
                    <span className="text-xs font-medium text-yellow-500 bg-yellow-950/50 border border-yellow-800 px-2 py-0.5 rounded-full">
                      Pending Review
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCancelOpen(true)}
                    disabled={!company?.isActive}
                    className="w-full border-red-900 text-red-400 hover:bg-red-950/20 hover:text-red-300"
                  >
                    Cancel Pending Request
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-400">No pending slot requests.</p>
                  <Button
                    onClick={() => setRequestOpen(true)}
                    disabled={!company?.isActive}
                    className="w-full bg-zinc-50 text-zinc-950 hover:bg-zinc-200"
                  >
                    Request More Slots
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links Card */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-zinc-200">Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <Link to="/company/users" className="block">
                <Button variant="outline" className="w-full border-zinc-800 text-zinc-300 hover:text-zinc-50 hover:bg-zinc-900">
                  Manage Company Users
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Panel */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-200">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4 divide-y divide-zinc-900">
                {activities.map((act) => (
                  <div key={act.id} className="pt-3 first:pt-0 flex items-center justify-between text-sm">
                    <div className="space-y-0.5">
                      <p className="font-medium text-zinc-300">
                        {actionLabels[act.action] || act.action}
                      </p>
                      {act.userName && (
                        <p className="text-xs text-zinc-500">By {act.userName}</p>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500">
                      {formatRelativeTime(act.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No recent activity recorded.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {company && (
        <>
          <RequestSlotsDialog
            isOpen={requestOpen}
            onClose={() => setRequestOpen(false)}
            onSuccess={refresh}
            hasPending={!!pendingRequest}
          />

          {pendingRequest && (
            <CancelSlotRequestDialog
              isOpen={cancelOpen}
              onClose={() => setCancelOpen(false)}
              onSuccess={refresh}
              requestId={pendingRequest.id}
              slotsCount={pendingRequest.requestedSlots}
            />
          )}
        </>
      )}
    </div>
  );
}
