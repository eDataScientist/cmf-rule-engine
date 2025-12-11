import { useState, useEffect, useRef } from 'react';
import { useSetAtom } from 'jotai';
import { ruleBuilderRulesAtom } from '@/store/atoms/ruleBuilder';
import { getRulesetForDataset } from '@/lib/db/operations';

interface UseRuleSetLoadResult {
  loading: boolean;
  error: string | null;
  hasLoaded: boolean;
}

/**
 * Hook to load existing ruleset for a dataset on mount
 * Returns hasLoaded flag to coordinate with auto-save
 */
export function useRuleSetLoad(datasetId: number): UseRuleSetLoadResult {
  const setRules = useSetAtom(ruleBuilderRulesAtom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Reset state when datasetId changes
    hasLoadedRef.current = false;
    setHasLoaded(false);

    async function load() {
      if (!datasetId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const ruleset = await getRulesetForDataset(datasetId);
        if (ruleset && ruleset.rules) {
          setRules(ruleset.rules);
        } else {
          // No existing ruleset - start with empty rules
          setRules([]);
        }
        // Mark as loaded AFTER setting rules
        hasLoadedRef.current = true;
        setHasLoaded(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Failed to load ruleset:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [datasetId, setRules]);

  return { loading, error, hasLoaded };
}
