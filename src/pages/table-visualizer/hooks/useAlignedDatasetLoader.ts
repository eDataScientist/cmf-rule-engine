import { useState, useCallback } from 'react';
import { downloadAlignedDataset } from '@/lib/storage/helpers';
import { getDataset, getRulesetForDataset } from '@/lib/db/operations';
import type { DatasetWithStatus, RuleSet } from '@/lib/db/operations';

interface UseAlignedDatasetLoaderResult {
  loadAlignedDataset: (datasetId: number) => Promise<{ file: File; dataset: DatasetWithStatus; ruleset: RuleSet | null } | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for loading aligned datasets for rule evaluation
 * Rules can only be executed against aligned datasets (not raw or CSV uploads)
 */
export function useAlignedDatasetLoader(): UseAlignedDatasetLoaderResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlignedDataset = useCallback(async (datasetId: number) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch dataset info
      const dataset = await getDataset(datasetId);
      if (!dataset) {
        throw new Error('Dataset not found');
      }

      // Check if aligned file exists
      if (!dataset.alignedFilePath) {
        throw new Error('No aligned file available for this dataset. Rules require aligned datasets.');
      }

      // Download aligned CSV from storage
      const blob = await downloadAlignedDataset(dataset.alignedFilePath);

      // Convert blob to File
      const file = new File(
        [blob],
        dataset.fileName ? `aligned_${dataset.fileName}` : `aligned_dataset_${dataset.id}.csv`,
        { type: 'text/csv' }
      );

      // Also fetch the ruleset for this dataset
      const ruleset = await getRulesetForDataset(datasetId);

      return { file, dataset, ruleset };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load aligned dataset';
      setError(errorMessage);
      console.error('Failed to load aligned dataset:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loadAlignedDataset, loading, error };
}
