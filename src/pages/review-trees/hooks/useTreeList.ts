import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { getTrees } from '@/lib/db/operations';
import { treesAtom } from '@/store';

export function useTreeList() {
  const [trees, setTrees] = useAtom(treesAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrees() {
      try {
        setIsLoading(true);
        const loadedTrees = await getTrees();
        setTrees(loadedTrees);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trees');
      } finally {
        setIsLoading(false);
      }
    }

    loadTrees();
  }, [setTrees]);

  return { trees, isLoading, error };
}
