import { useState, useCallback } from 'react';
import { TabularClaimsProcessor } from '@/lib/processing/TabularClaimsProcessor';
import type { ClaimData } from '@/lib/types/claim';
import type { TraceResult } from '@/lib/types/trace';
import type { TreeNode } from '@/lib/types/tree';

interface ValidationResult {
  isValid: boolean;
  missingColumns: string[];
  availableColumns: string[];
  requiredColumns: string[];
}

interface UseBulkEvaluationReturn {
  processor: TabularClaimsProcessor | null;
  createProcessor: (treeStructure: { title: string; root: TreeNode }[]) => TabularClaimsProcessor;
  validateColumns: (csvColumns: string[]) => ValidationResult | null;
  evaluate: (claims: ClaimData[]) => Promise<TraceResult[]>;
  results: TraceResult[];
  isProcessing: boolean;
  error: string | null;
}

export function useBulkEvaluation(): UseBulkEvaluationReturn {
  const [processor, setProcessor] = useState<TabularClaimsProcessor | null>(null);
  const [results, setResults] = useState<TraceResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProcessor = useCallback(
    (treeStructure: { title: string; root: TreeNode }[]) => {
      const newProcessor = new TabularClaimsProcessor(treeStructure);
      setProcessor(newProcessor);
      return newProcessor;
    },
    []
  );

  const validateColumns = useCallback(
    (csvColumns: string[]): ValidationResult | null => {
      if (!processor) return null;
      return processor.validateColumns(csvColumns);
    },
    [processor]
  );

  const evaluate = useCallback(
    async (claims: ClaimData[]): Promise<TraceResult[]> => {
      if (!processor) {
        setError('Processor not initialized. Please select a tree first.');
        return [];
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Process all claims using the processor
        const evaluatedResults = processor.processBatch(claims);

        setResults(evaluatedResults);
        setIsProcessing(false);
        return evaluatedResults;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Evaluation failed: ${errorMessage}`);
        setIsProcessing(false);
        setResults([]);
        return [];
      }
    },
    [processor]
  );

  return { processor, createProcessor, validateColumns, evaluate, results, isProcessing, error };
}
