import { useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { supabase } from '@/lib/db/supabase';
import {
  distinctValuesCacheAtom,
  ruleBuilderDatasetIdAtom,
  ruleBuilderLoadingAtom,
} from '@/store/atoms/ruleBuilder';

/**
 * Hook to fetch and cache distinct values for string columns
 */
export function useDistinctValues() {
  const [cache, setCache] = useAtom(distinctValuesCacheAtom);
  const datasetId = useAtomValue(ruleBuilderDatasetIdAtom);
  const [loading, setLoading] = useAtom(ruleBuilderLoadingAtom);

  const fetchDistinctValues = useCallback(
    async (columnName: string): Promise<string[] | null> => {
      if (!datasetId) return null;

      const cacheKey = `${datasetId}:${columnName}`;

      // Check cache first
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey) ?? null;
      }

      setLoading((prev) => ({ ...prev, distinctValues: true }));

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-column-distinct-values`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              dataset_id: datasetId,
              column_name: columnName,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch distinct values');
        }

        const result = await response.json();

        // Update cache
        setCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(cacheKey, result.values);
          return newCache;
        });

        return result.values;
      } catch (error) {
        console.error('Failed to fetch distinct values:', error);
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, distinctValues: false }));
      }
    },
    [datasetId, cache, setCache, setLoading]
  );

  return { fetchDistinctValues, isLoading: loading.distinctValues };
}
