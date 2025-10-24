import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';

export function useImageExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportAsImage = useCallback(async (elementId: string, filename: string = 'trace') => {
    try {
      setIsExporting(true);
      setError(null);

      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Element not found');
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export image');
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportAsImage, isExporting, error };
}
