import { useState, useCallback } from 'react';
import { downloadAlignedDataset } from '@/lib/storage/helpers';
import type { DatasetWithStatus } from '@/lib/db/operations';

interface PreviewData {
  headers: string[];
  rows: Record<string, string>[];
}

export function useDataPreview(dataset: DatasetWithStatus | null) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const pageSize = 50;

  const loadPreview = useCallback(async (page: number = 0) => {
    if (!dataset?.alignedFilePath || loading) return;

    setLoading(true);
    try {
      const blob = await downloadAlignedDataset(dataset.alignedFilePath, true);
      const text = await blob.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length === 0) return;

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const totalDataRows = lines.length - 1;
      setTotalRows(totalDataRows);

      const startRow = page * pageSize + 1;
      const endRow = Math.min(startRow + pageSize, lines.length);

      const rows = lines.slice(startRow, endRow).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setPreviewData({ headers, rows });
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to load data preview:', err);
    } finally {
      setLoading(false);
    }
  }, [dataset?.alignedFilePath, loading, pageSize]);

  const nextPage = useCallback(() => {
    loadPreview(currentPage + 1);
  }, [currentPage, loadPreview]);

  const prevPage = useCallback(() => {
    loadPreview(Math.max(0, currentPage - 1));
  }, [currentPage, loadPreview]);

  const totalPages = Math.ceil(totalRows / pageSize);

  return {
    previewData,
    loading,
    loadPreview,
    currentPage,
    totalPages,
    totalRows,
    nextPage,
    prevPage,
    pageSize,
  };
}
