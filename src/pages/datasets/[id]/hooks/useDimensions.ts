import { useState, useEffect } from 'react';
import { getAllDimensions, type Dimension } from '@/lib/db/operations';

export function useDimensions() {
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getAllDimensions();
        setDimensions(data);
      } catch (err) {
        console.error('Failed to load dimensions:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { dimensions, loading };
}
