import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import {
  approveSlotRequest,
  denySlotRequest,
  type SlotRequest,
} from '@/lib/db/admin-operations';

interface PendingRequestsProps {
  requests: SlotRequest[];
  onUpdate: () => void;
}

export function PendingRequests({ requests, onUpdate }: PendingRequestsProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setProcessingId(id);
    try {
      await approveSlotRequest(id);
      onUpdate();
    } catch (err) {
      console.error('Failed to approve request:', err);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDeny(id: string) {
    setProcessingId(id);
    try {
      await denySlotRequest(id);
      onUpdate();
    } catch (err) {
      console.error('Failed to deny request:', err);
    } finally {
      setProcessingId(null);
    }
  }

  if (requests.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Pending Slot Requests
          </CardTitle>
          <span
            className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium"
            style={{ backgroundColor: 'var(--color-status-orange)', color: '#fff' }}
          >
            {requests.length}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between rounded-lg border p-3"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {req.companyName ?? 'Unknown Company'}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  +{req.requestedSlots} slot{req.requestedSlots !== 1 ? 's' : ''} requested
                  {req.requestedByName && ` by ${req.requestedByName}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 ml-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-green-900/20 hover:text-green-400"
                  onClick={() => handleApprove(req.id)}
                  disabled={processingId === req.id}
                  title="Approve"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-red-900/20 hover:text-red-400"
                  onClick={() => handleDeny(req.id)}
                  disabled={processingId === req.id}
                  title="Deny"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
