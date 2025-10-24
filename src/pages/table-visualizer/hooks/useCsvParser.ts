import { useState } from 'react';
import Papa from 'papaparse';
import type { ClaimData } from '@/lib/types/claim';

interface UseCsvParserReturn {
  parse: (file: File) => Promise<void>;
  claims: ClaimData[];
  isLoading: boolean;
  error: string | null;
  clear: () => void;
}

export function useCsvParser(): UseCsvParserReturn {
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parse = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();

      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(`CSV parsing errors: ${results.errors[0].message}`);
            setClaims([]);
          } else if (results.data.length === 0) {
            setError('CSV file is empty');
            setClaims([]);
          } else {
            setClaims(results.data as ClaimData[]);
          }
          setIsLoading(false);
        },
        error: (err: Error) => {
          setError(`Failed to parse CSV: ${err.message}`);
          setClaims([]);
          setIsLoading(false);
        },
      });
    } catch (err) {
      setError(`Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setClaims([]);
      setIsLoading(false);
    }
  };

  const clear = () => {
    setClaims([]);
    setError(null);
  };

  return { parse, claims, isLoading, error, clear };
}
