import { useState, useCallback } from 'react';
import { evaluateClaim } from '@/lib/scoring/engine';
import type { ClaimData } from '@/lib/types/claim';
import type { TreeNode } from '@/lib/types/tree';
import type { TraceResult } from '@/lib/types/trace';

export function useClaimEvaluation() {
  const [result, setResult] = useState<TraceResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback((
    claim: ClaimData,
    trees: { title: string; root: TreeNode }[]
  ) => {
    if (!claim['Claim number']) {
      setError('Claim number is required');
      return;
    }

    if (trees.length === 0) {
      setError('No trees available for evaluation');
      return;
    }

    try {
      setIsEvaluating(true);
      setError(null);

      const traceResult = evaluateClaim(claim, trees);
      setResult(traceResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate claim');
      setResult(null);
    } finally {
      setIsEvaluating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsEvaluating(false);
  }, []);

  return { result, isEvaluating, error, evaluate, reset };
}
