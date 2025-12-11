import { useState, useEffect } from 'react';
import { getDatasetsWithRulesets, type DatasetWithRuleset } from '@/lib/db/operations';

interface UseDatasetRulesetsResult {
  datasets: DatasetWithRuleset[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDatasetRulesets(): UseDatasetRulesetsResult {
  const [datasets, setDatasets] = useState<DatasetWithRuleset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDatasets = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDatasetsWithRulesets();
      setDatasets(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  return {
    datasets,
    loading,
    error,
    refetch: fetchDatasets,
  };
}
