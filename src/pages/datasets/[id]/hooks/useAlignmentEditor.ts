import { useState, useMemo, useCallback } from 'react';
import type { DatasetWithStatus } from '@/lib/db/operations';
import { validateAlignment } from '../utils/validateAlignment';

export function useAlignmentEditor(dataset: DatasetWithStatus | null) {
  const [editMode, setEditMode] = useState(false);
  const [editableAlignment, setEditableAlignment] = useState<Record<string, string>>({});
  const [originalAlignment, setOriginalAlignment] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  const hasChanges = useMemo(() => {
    if (!editMode) return false;
    return JSON.stringify(editableAlignment) !== JSON.stringify(originalAlignment);
  }, [editMode, editableAlignment, originalAlignment]);

  const startEdit = useCallback(() => {
    if (!dataset?.alignmentMapping) return;
    const alignmentCopy = { ...dataset.alignmentMapping };
    setEditableAlignment(alignmentCopy);
    setOriginalAlignment(alignmentCopy);
    setEditMode(true);
    setValidationError(null);
  }, [dataset?.alignmentMapping]);

  const cancelEdit = useCallback(() => {
    setEditMode(false);
    setEditableAlignment({});
    setOriginalAlignment({});
    setValidationError(null);
  }, []);

  const handleDimensionChange = useCallback((originalColumn: string, newDimension: string) => {
    setEditableAlignment(prev => ({ ...prev, [originalColumn]: newDimension }));
    setValidationError(null);
  }, []);

  const validate = useCallback(() => {
    const result = validateAlignment(editableAlignment);
    if (!result.valid) {
      setValidationError(result.error!);
      return false;
    }
    setValidationError(null);
    return true;
  }, [editableAlignment]);

  return {
    editMode,
    editableAlignment,
    validationError,
    hasChanges,
    startEdit,
    cancelEdit,
    handleDimensionChange,
    validate
  };
}
