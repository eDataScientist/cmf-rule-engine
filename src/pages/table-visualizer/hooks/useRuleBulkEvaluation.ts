import { useState, useCallback, useRef } from 'react';
import { RuleExecutor } from '@/lib/scoring/RuleExecutor';
import type { ClaimData } from '@/lib/types/claim';
import type { RuleExecutionResult } from '@/lib/types/ruleExecution';
import type { RuleItem } from '@/lib/types/ruleBuilder';

interface UseRuleBulkEvaluationResult {
  executor: RuleExecutor | null;
  createExecutor: (rules: RuleItem[]) => void;
  evaluate: (claims: ClaimData[]) => Promise<RuleExecutionResult[]>;
  isProcessing: boolean;
  error: string | null;
}

/**
 * Hook for bulk rule evaluation against claims
 * Parallel to useBulkEvaluation but for rules instead of trees
 */
export function useRuleBulkEvaluation(): UseRuleBulkEvaluationResult {
  const executorRef = useRef<RuleExecutor | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExecutor = useCallback((rules: RuleItem[]) => {
    try {
      executorRef.current = new RuleExecutor(rules);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create rule executor';
      setError(errorMessage);
      console.error('Failed to create rule executor:', err);
    }
  }, []);

  const evaluate = useCallback(async (claims: ClaimData[]): Promise<RuleExecutionResult[]> => {
    if (!executorRef.current) {
      setError('No rules loaded. Please select a dataset with rules.');
      return [];
    }

    if (claims.length === 0) {
      return [];
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Process in batches for better UI responsiveness
      const BATCH_SIZE = 100;
      const results: RuleExecutionResult[] = [];

      for (let i = 0; i < claims.length; i += BATCH_SIZE) {
        const batch = claims.slice(i, i + BATCH_SIZE);
        const batchResults = executorRef.current.evaluateBatch(batch);
        results.push(...batchResults);

        // Yield to UI thread between batches
        if (i + BATCH_SIZE < claims.length) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to evaluate rules';
      setError(errorMessage);
      console.error('Rule evaluation failed:', err);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    executor: executorRef.current,
    createExecutor,
    evaluate,
    isProcessing,
    error,
  };
}
