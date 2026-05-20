import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cancelSlotRequest } from '@/lib/db/client-operations';

interface CancelSlotRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requestId: string;
  slotsCount: number;
}

export function CancelSlotRequestDialog({
  isOpen,
  onClose,
  onSuccess,
  requestId,
  slotsCount,
}: CancelSlotRequestDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    const result = await cancelSlotRequest(requestId);
    setLoading(false);

    if (result.ok) {
      onSuccess();
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-md p-6 max-w-sm w-full space-y-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-50">Cancel Slot Request</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Are you sure you want to cancel your pending slot request for {slotsCount} slots?
          </p>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-zinc-800 text-zinc-400 hover:text-zinc-50"
          >
            Go Back
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </div>
      </div>
    </div>
  );
}
