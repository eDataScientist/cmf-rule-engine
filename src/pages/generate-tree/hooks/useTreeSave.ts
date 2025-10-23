import { useState, useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { createTree } from '@/lib/db/operations';
import { treesAtom } from '@/store';
import type { Tree, TreeType } from '@/lib/types/tree';

export function useTreeSave() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setTrees = useSetAtom(treesAtom);

  const save = useCallback(
    async (name: string, treeType: TreeType, structure: Tree['structure']) => {
      setIsSaving(true);
      setError(null);

      try {
        const newTree = await createTree({
          id: crypto.randomUUID(),
          name,
          treeType,
          structure,
        });

        setTrees((prev) => [...prev, newTree]);
        return newTree;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save tree';
        setError(errorMessage);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [setTrees]
  );

  return { save, isSaving, error };
}
