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

// Decision Trees Page View Settings
export const treeViewModeAtom = atomWithStorage<'grid' | 'list'>(
  'tree-view-mode',
  'list'
);

export const treeSearchQueryAtom = atomWithStorage<string>(
  'tree-search-query',
  ''
);

export const treeCurrentPageAtom = atomWithStorage<number>(
  'tree-current-page',
  1
);

export const treePageSizeAtom = atomWithStorage<number>(
  'tree-page-size',
  10
);
