import { useState, useMemo } from 'react';
import { type DatasetWithStatus } from '@/lib/db/operations';

export function useDatasetSort(datasets: DatasetWithStatus[]) {
  const [sortConfig, setSortConfig] = useState<{
    column: string;
    direction: 'asc' | 'desc';
  }>({
    column: 'uploaded',
    direction: 'desc',
  });

  const handleSort = (column: string) => {
    setSortConfig((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedDatasets = useMemo(() => {
    const sorted = [...datasets];

    sorted.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortConfig.column) {
        case 'name':
          aVal = a.nickname || a.fileName || '';
          bVal = b.nickname || b.fileName || '';
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);

        case 'dimensions':
          aVal = a.rows || 0;
          bVal = b.rows || 0;
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;

        case 'uploaded':
          aVal = new Date(a.uploadedAt || a.createdAt).getTime();
          bVal = new Date(b.uploadedAt || b.createdAt).getTime();
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;

        default:
          return 0;
      }
    });

    return sorted;
  }, [datasets, sortConfig]);

  return { sortedDatasets, sortConfig, handleSort };
}
