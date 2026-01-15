import { useState, useEffect } from 'react';
import { getAllDimensions, type Dimension } from '@/lib/db/operations';
import type { ClaimCategory } from '@/lib/db/types';

export function useDimensions(claimCategory?: ClaimCategory) {
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getAllDimensions(claimCategory);
        setDimensions(data);
      } catch (err) {
        console.error('Failed to load dimensions:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [claimCategory]);

  return { dimensions, loading };
}
