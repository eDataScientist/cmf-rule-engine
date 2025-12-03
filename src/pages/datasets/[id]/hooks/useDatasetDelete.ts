import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteDataset } from '@/lib/db/operations';

export function useDatasetDelete(datasetId: string | undefined) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!datasetId) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this dataset? This action cannot be undone.'
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteDataset(Number(datasetId));
      navigate('/datasets');
    } catch (err) {
      console.error('Failed to delete dataset:', err);
      alert('Failed to delete dataset');
      setDeleting(false);
    }
  }, [datasetId, navigate]);

  return { handleDelete, deleting };
}
