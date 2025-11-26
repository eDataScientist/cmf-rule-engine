import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db/supabase';

export interface UploadStatus {
  id: string;
  datasetId: number | null;
  status: 'uploading' | 'processing' | 'uploaded' | 'failed';
  errorMessage: string | null;
  updatedAt: string;
}

/**
 * Subscribe to realtime updates for a dataset's upload status
 * @param datasetId - Dataset ID to monitor
 * @returns Current upload status and loading state
 */
export function useDatasetStatus(datasetId: number | null) {
  const [status, setStatus] = useState<UploadStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!datasetId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Fetch initial status
    async function fetchInitialStatus() {
      try {
        const { data, error: fetchError } = await supabase
          .from('dataset_upload_status')
          .select('*')
          .eq('dataset_id', datasetId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (mounted && data) {
          setStatus({
            id: data.id,
            datasetId: data.dataset_id,
            status: data.status as UploadStatus['status'],
            errorMessage: data.error_message,
            updatedAt: data.updated_at,
          });
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch status'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchInitialStatus();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`dataset-status-${datasetId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dataset_upload_status',
          filter: `dataset_id=eq.${datasetId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newData = payload.new as any;
            if (mounted) {
              setStatus({
                id: newData.id,
                datasetId: newData.dataset_id,
                status: newData.status,
                errorMessage: newData.error_message,
                updatedAt: newData.updated_at,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [datasetId]);

  return { status, loading, error };
}
