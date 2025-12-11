import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { supabase } from '@/lib/db/supabase';
import {
  ruleBuilderDimensionsCacheAtom,
  ruleBuilderLoadingAtom,
  ruleBuilderErrorAtom,
} from '@/store/atoms/ruleBuilder';
import type { RuleBuilderDimension } from '@/lib/types/ruleBuilder';

/**
 * Hook to fetch and cache dimensions for a dataset
 */
export function useDatasetDimensions(datasetId: number | null) {
  const [cache, setCache] = useAtom(ruleBuilderDimensionsCacheAtom);
  const setLoading = useSetAtom(ruleBuilderLoadingAtom);
  const setError = useSetAtom(ruleBuilderErrorAtom);

  useEffect(() => {
    if (datasetId === null) return;

    // Check cache first
    if (cache.has(datasetId)) return;

    // Capture datasetId for use in async function
    const currentDatasetId = datasetId;

    async function fetchDimensions() {
      setLoading((prev) => ({ ...prev, dimensions: true }));
      setError(null);

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-dataset-dimensions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ dataset_id: currentDatasetId }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch dimensions');
        }

        const dimensions: RuleBuilderDimension[] = await response.json();

        // Update cache
        setCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(currentDatasetId, dimensions);
          return newCache;
        });
      } catch (error) {
        console.error('Failed to fetch dimensions:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch dimensions');
      } finally {
        setLoading((prev) => ({ ...prev, dimensions: false }));
      }
    }

    fetchDimensions();
  }, [datasetId, cache, setCache, setLoading, setError]);
}
