import { useState, useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { deleteTree } from '@/lib/db/operations';
import { treesAtom } from '@/store';

export function useTreeDelete() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setTrees = useSetAtom(treesAtom);

  const remove = useCallback(
    async (id: string) => {
      setIsDeleting(true);
      setError(null);

      try {
        await deleteTree(id);
        setTrees((prev) => prev.filter((tree) => tree.id !== id));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete tree';
        setError(errorMessage);
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [setTrees]
  );

  return { remove, isDeleting, error };
}
