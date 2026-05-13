import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import {
  Building2,
  Users,
  Database,
  GitBranch,
  Plus,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { headerBreadcrumbsAtom } from '@/store/atoms/header';
import { StatCard } from './components/StatCard';
import { ActivityFeed } from './components/ActivityFeed';
import { PendingRequests } from './components/PendingRequests';
import { useAdminDashboard } from './hooks/useAdminDashboard';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);
  const { counts, recentActivity, pendingSlotRequests, loading, error, refresh } =
    useAdminDashboard();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Admin', href: '/admin' }]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm" style={{ color: 'var(--color-status-red)' }}>{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Platform overview and management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/companies')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Company
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/admin/users')}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Register User
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Companies"
          value={counts?.companies ?? 0}
          icon={Building2}
          description="Total registered"
        />
        <StatCard
          title="Users"
          value={counts?.users ?? 0}
          icon={Users}
          description="Across all companies"
        />
        <StatCard
          title="Datasets"
          value={counts?.datasets ?? 0}
          icon={Database}
          description="Uploaded to platform"
        />
        <StatCard
          title="Decision Trees"
          value={counts?.trees ?? 0}
          icon={GitBranch}
          description="Generated models"
        />
      </div>

      {/* Activity + Requests */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed entries={recentActivity} loading={loading} />
        </div>
        <div className="space-y-6">
          <PendingRequests requests={pendingSlotRequests} onUpdate={refresh} />
        </div>
      </div>
    </div>
  );
}
