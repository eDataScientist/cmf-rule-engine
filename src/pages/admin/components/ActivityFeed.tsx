import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActivityLogEntry } from '@/lib/db/admin-operations';

interface ActivityFeedProps {
  entries: ActivityLogEntry[];
  loading?: boolean;
}

const ACTION_LABELS: Record<string, string> = {
  create_company: 'Created company',
  update_company: 'Updated company',
  deactivate_company: 'Deactivated company',
  reactivate_company: 'Reactivated company',
  register_user: 'Registered user',
  deactivate_user: 'Deactivated user',
  reactivate_user: 'Reactivated user',
  update_user_role: 'Updated user role',
  approve_slot_request: 'Approved slot request',
  deny_slot_request: 'Denied slot request',
};

function formatAction(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/_/g, ' ');
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;

  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function getActionDot(action: string): string {
  if (action.includes('create') || action.includes('register') || action.includes('approve')) {
    return 'var(--color-status-green)';
  }
  if (action.includes('deactivate') || action.includes('deny') || action.includes('delete')) {
    return 'var(--color-status-red)';
  }
  return 'var(--color-brand-blue)';
}

export function ActivityFeed({ entries, loading }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : entries.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No recent activity
          </p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3">
                <div
                  className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: getActionDot(entry.action) }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    <span className="font-medium">{formatAction(entry.action)}</span>
                    {entry.targetType && (
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        {' '} ({entry.targetType})
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {entry.userName ?? `User ${entry.userId.slice(0, 8)}`}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {formatTimeAgo(entry.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
