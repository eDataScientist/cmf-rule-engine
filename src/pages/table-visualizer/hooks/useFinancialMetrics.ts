import { useState, useCallback } from 'react';
import { supabase } from '@/lib/db/supabase';
import type { FinancialMetrics } from '@/lib/types/trace';

type RiskLevel = 'low' | 'moderate' | 'high';

interface UseFinancialMetricsReturn {
  financialMetrics: FinancialMetrics | null;
  isLoading: boolean;
  error: string | null;
  fetchFinancialMetrics: (
    datasetId: number,
    predictions: Record<string, RiskLevel>
  ) => Promise<void>;
  clearMetrics: () => void;
}

export function useFinancialMetrics(): UseFinancialMetricsReturn {
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialMetrics = useCallback(async (
    datasetId: number,
    predictions: Record<string, RiskLevel>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-financial-metrics`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            dataset_id: datasetId,
            predictions,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch financial metrics');
      }

      const metrics: FinancialMetrics = await response.json();
      setFinancialMetrics(metrics);
    } catch (err) {
      console.error('Failed to fetch financial metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMetrics = useCallback(() => {
    setFinancialMetrics(null);
    setError(null);
  }, []);

  return {
    financialMetrics,
    isLoading,
    error,
    fetchFinancialMetrics,
    clearMetrics,
  };
}
