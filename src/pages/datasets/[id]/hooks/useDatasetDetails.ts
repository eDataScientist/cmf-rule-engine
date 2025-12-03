import { useState, useEffect } from 'react';
import { getDataset, type DatasetWithStatus } from '@/lib/db/operations';

export function useDatasetDetails(id: string | undefined) {
  const [dataset, setDataset] = useState<DatasetWithStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        setLoading(true);
        const data = await getDataset(Number(id));
        if (!data) {
          setError('Dataset not found');
          return;
        }
        setDataset(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dataset');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const updateDataset = (updatedDataset: DatasetWithStatus) => {
    setDataset(updatedDataset);
  };

  return { dataset, loading, error, updateDataset };
}
