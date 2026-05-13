import { Fragment, useEffect, useState, useCallback } from 'react';
import { useSetAtom } from 'jotai';
import {
  ScrollText,
  Search,
  Loader2,
  Download,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { headerBreadcrumbsAtom } from '@/store/atoms/header';
import {
  getActivityLog,
  type ActivityLogEntry,
  type ActivityLogFilters,
} from '@/lib/db/admin-operations';

const PAGE_SIZE = 25;

export default function AdminLogs() {
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);

  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Admin', href: '/admin' },
      { label: 'Activity Logs', href: '/admin/logs' },
    ]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ActivityLogFilters = {};
      if (actionFilter) {
        filters.action = actionFilter;
      }
      if (debouncedSearchQuery) {
        filters.search = debouncedSearchQuery;
      }

      const result = await getActivityLog(filters, PAGE_SIZE, page * PAGE_SIZE);
      setEntries(result.entries);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, debouncedSearchQuery, page]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function exportCsv() {
    const headers = ['Time', 'Action', 'User', 'Target Type', 'Target ID', 'Details'];
    const rows = entries.map((entry) => [
      entry.createdAt,
      entry.action,
      entry.userName ?? entry.userId,
      entry.targetType ?? '',
      entry.targetId ?? '',
      JSON.stringify(entry.details ?? {}),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Activity Logs
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Audit trail of all admin actions ({total} total)
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={exportCsv}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(0);
          }}
          className="flex h-9 rounded-md border px-3 py-1 text-sm"
          style={{
            backgroundColor: 'var(--color-bg-input)',
            borderColor: 'var(--color-border-strong)',
            color: 'var(--color-text-primary)',
          }}
        >
          <option value="">All actions</option>
          <option value="create_company">Create Company</option>
          <option value="update_company">Update Company</option>
          <option value="deactivate_company">Deactivate Company</option>
          <option value="reactivate_company">Reactivate Company</option>
          <option value="register_user">Register User</option>
          <option value="deactivate_user">Deactivate User</option>
          <option value="reactivate_user">Reactivate User</option>
          <option value="approve_slot_request">Approve Slot Request</option>
          <option value="deny_slot_request">Deny Slot Request</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ScrollText className="mb-3 h-10 w-10" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No activity logs found
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <th className="w-8 px-2 py-3" />
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Time
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Action
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    User
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Target
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  return (
                    <Fragment key={entry.id}>
                      <tr className="group">
                        <td className="px-2 py-3">
                          <button
                            className="flex h-5 w-5 items-center justify-center rounded hover:bg-zinc-800"
                            onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                            aria-label={isExpanded ? 'Collapse log details' : 'Expand log details'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--color-text-muted)' }} />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" style={{ color: 'var(--color-text-muted)' }} />
                            )}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--color-text-muted)' }}>
                          {new Date(entry.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {entry.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                          {entry.userName ?? `User ${entry.userId.slice(0, 8)}`}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                          {entry.targetType ?? '-'}
                        </td>
                      </tr>
                      {isExpanded && entry.details && (
                        <tr>
                          <td colSpan={5} className="px-4 py-3">
                            <pre
                              className="overflow-x-auto rounded-md p-3 text-xs"
                              style={{
                                backgroundColor: 'var(--color-bg-app)',
                                color: 'var(--color-text-secondary)',
                              }}
                            >
                              {JSON.stringify(entry.details, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
