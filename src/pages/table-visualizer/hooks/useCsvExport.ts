import { useState } from 'react';
import Papa from 'papaparse';
import type { ClaimData } from '@/lib/types/claim';
import type { TraceResult } from '@/lib/types/trace';

interface ExportData {
  claim: ClaimData;
  result: TraceResult;
}

interface UseCsvExportReturn {
  exportToCsv: (data: ExportData[], filename?: string) => void;
  isExporting: boolean;
  error: string | null;
}

export function useCsvExport(): UseCsvExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportToCsv = (data: ExportData[], filename = 'claims-results.csv') => {
    setIsExporting(true);
    setError(null);

    try {
      // Combine claim data with results
      const exportRows = data.map(({ claim, result }) => ({
        ...claim,
        fraud_score: result.totalScore.toFixed(3),
        fraud_probability: (result.probability * 100).toFixed(1) + '%',
        risk_level: result.riskLevel,
      }));

      const csv = Papa.unparse(exportRows);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
    } catch (err) {
      setError(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsExporting(false);
    }
  };

  return { exportToCsv, isExporting, error };
}
