import { useMemo } from 'react';
import type { ClaimWithResult } from '@/store/atoms/tableVisualization';

export function useClaimSearch(
  claims: ClaimWithResult[],
  searchQuery: string,
  claimNumberColumn: string | null
): ClaimWithResult[] {
  return useMemo(() => {
    // No search query or no column configured
    if (!searchQuery.trim() || !claimNumberColumn) {
      return claims;
    }

    const lowerQuery = searchQuery.toLowerCase();

    return claims.filter(item => {
      const claimNumber = String(item.claim[claimNumberColumn] || '');
      return claimNumber.toLowerCase().includes(lowerQuery);
    });
  }, [claims, searchQuery, claimNumberColumn]);
}
