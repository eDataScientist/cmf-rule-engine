import { useState, useEffect } from 'react';
import { supabase } from '@/lib/db/supabase';

export interface QualityMetrics {
  dataset_id: number;
  total_dimensions: number;
  present_dimensions: number;
  completeness_percentage: number;
  missing_critical_columns: string[];
  critical_completeness_percentage: number;
  quality_score: number;
}

export function useQualityMetrics(datasetId: string | undefined) {
  const [quality, setQuality] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!datasetId) return;

    async function load() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-dataset-quality`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dataset_id: Number(datasetId) }),
          }
        );

        if (!response.ok) throw new Error('Failed to fetch quality metrics');

        const data = await response.json();
        setQuality(data);
      } catch (err) {
        console.error('Failed to load quality metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [datasetId]);

  return { quality, loading };
}
