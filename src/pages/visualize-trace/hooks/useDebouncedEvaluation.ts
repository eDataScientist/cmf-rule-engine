import { useState, useEffect, useRef } from 'react';
import { evaluateClaim } from '@/lib/scoring/engine';
import type { ClaimData } from '@/lib/types/claim';
import type { TreeNode } from '@/lib/types/tree';
import type { TraceResult } from '@/lib/types/trace';

export function useDebouncedEvaluation(
  claim: ClaimData,
  trees: { title: string; root: TreeNode }[] | undefined,
  debounceMs: number = 300
) {
  const [result, setResult] = useState<TraceResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't evaluate if no trees or no claim number
    if (!trees || trees.length === 0 || !claim['Claim number']) {
      setResult(null);
      setError(null);
      setIsEvaluating(false);
      return;
    }

    setIsEvaluating(true);
    setError(null);

    // Debounced evaluation
    timeoutRef.current = setTimeout(() => {
      try {
        const traceResult = evaluateClaim(claim, trees);
        setResult(traceResult);
        setError(null);
      } catch (err) {
        console.error('Evaluation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to evaluate claim');
        setResult(null);
      } finally {
        setIsEvaluating(false);
      }
    }, debounceMs);

    // Cleanup on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [claim, trees, debounceMs]);

  return { result, isEvaluating, error };
}
