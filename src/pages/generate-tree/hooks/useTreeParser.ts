import { useState, useCallback } from 'react';
import { parseFIGS } from '@/lib/parsers/figs';
import type { TreeNode } from '@/lib/types/tree';

export function useTreeParser() {
  const [parsed, setParsed] = useState<{ title: string; root: TreeNode }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const parse = useCallback((input: string) => {
    if (!input.trim()) {
      setParsed(null);
      setError(null);
      setIsValid(false);
      return;
    }

    try {
      const trees = parseFIGS(input);

      if (trees.length === 0) {
        setError('No valid trees found in input');
        setParsed(null);
        setIsValid(false);
        return;
      }

      setParsed(trees);
      setError(null);
      setIsValid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse tree');
      setParsed(null);
      setIsValid(false);
    }
  }, []);

  const reset = useCallback(() => {
    setParsed(null);
    setError(null);
    setIsValid(false);
  }, []);

  return { parsed, error, isValid, parse, reset };
}
