import { useMemo } from 'react';
import type { ClaimWithResult } from '@/store/atoms/tableVisualization';
import type { EnrichedTraceResult } from '@/lib/types/trace';

export function useFinancialData(
  claimsWithResults: ClaimWithResult[]
): EnrichedTraceResult[] {
  return useMemo(() => {
    return claimsWithResults
      .filter((item) => item.result !== undefined)
      .map((item) => {
        // Try multiple column names for claim value (aligned datasets use standardized names)
        const rawAmount =
          item.claim['EstimateValue'] ||
          item.claim['ApprovedClaimAmount'] ||
          item.claim['Estimated_Amount']; // Fallback for legacy CSVs

        let estimatedAmount: number | null = null;

        if (rawAmount !== undefined && rawAmount !== null && rawAmount !== '') {
          const parsed = typeof rawAmount === 'number'
            ? rawAmount
            : parseFloat(String(rawAmount));

          if (!isNaN(parsed) && parsed >= 0) {
            estimatedAmount = parsed;
          }
        }

        return {
          ...item.result!,
          estimatedAmount,
        };
      });
  }, [claimsWithResults]);
}
