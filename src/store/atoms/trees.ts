import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Tree } from '@/lib/types/tree';

export const treesAtom = atom<Tree[]>([]);

export const selectedTreeIdAtom = atomWithStorage<string | null>(
  'selected-tree-id',
  null
);

export const selectedTreeAtom = atom((get) => {
  const trees = get(treesAtom);
  const selectedId = get(selectedTreeIdAtom);
  return trees.find((t) => t.id === selectedId) || null;
});
