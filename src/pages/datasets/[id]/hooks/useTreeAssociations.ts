import { useState, useEffect, useCallback } from 'react';
import { getDatasetTreeAssociations, type TreeAssociation } from '@/lib/db/operations';

export function useTreeAssociations(datasetId: string | undefined) {
  const [associations, setAssociations] = useState<TreeAssociation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAssociations = useCallback(async () => {
    if (!datasetId) return;

    try {
      setLoading(true);
      const data = await getDatasetTreeAssociations(Number(datasetId));
      setAssociations(data);
    } catch (err) {
      console.error('Failed to load tree associations:', err);
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    loadAssociations();
  }, [loadAssociations]);

  return { associations, loading, refetch: loadAssociations };
}
