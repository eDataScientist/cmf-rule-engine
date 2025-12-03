import { Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: 'uploading' | 'processing' | 'uploaded' | 'failed' | 'ready';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          dotColor: 'bg-blue-500',
          textColor: 'text-blue-400',
          label: 'Uploading',
          showSpinner: true,
        };
      case 'processing':
        return {
          dotColor: 'bg-yellow-500',
          textColor: 'text-yellow-400',
          label: 'Processing',
          showSpinner: true,
        };
      case 'uploaded':
      case 'ready':
        return {
          dotColor: 'bg-green-500',
          textColor: 'text-green-400',
          label: 'Ready',
          showSpinner: false,
        };
      case 'failed':
        return {
          dotColor: 'bg-red-500',
          textColor: 'text-red-400',
          label: 'Failed',
          showSpinner: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      {config.showSpinner ? (
        <Loader2 className={`h-3 w-3 animate-spin ${config.textColor}`} />
      ) : (
        <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
      )}
      <span className={`text-sm ${config.textColor}`}>{config.label}</span>
    </div>
  );
}
