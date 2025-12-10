import { useState, useCallback } from 'react';
import { updateDatasetAlignment, type DatasetWithStatus } from '@/lib/db/operations';
import { supabase } from '@/lib/db/supabase';

export function useAlignmentSave(
  datasetId: string | undefined,
  _dataset: DatasetWithStatus | null,
  previewData: any,
  onSaveSuccess: (newAlignment: Record<string, string>) => void,
  onReloadPreview: () => void
) {
  const [saving, setSaving] = useState(false);

  const saveAlignment = useCallback(async (
    editableAlignment: Record<string, string>,
    hasChanges: boolean
  ) => {
    if (!hasChanges || !datasetId) return;

    setSaving(true);
    try {
      await updateDatasetAlignment(Number(datasetId), editableAlignment);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/regenerate-aligned-dataset`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dataset_id: Number(datasetId),
            alignment_mapping: editableAlignment,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to regenerate aligned dataset');

      onSaveSuccess(editableAlignment);

      if (previewData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        onReloadPreview();
      }
    } catch (err) {
      console.error('Failed to save alignment:', err);
      alert(`Failed to save alignment mapping: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  }, [datasetId, previewData, onSaveSuccess, onReloadPreview]);

  return { saveAlignment, saving };
}
