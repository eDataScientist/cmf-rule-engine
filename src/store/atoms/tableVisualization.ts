import { atom } from 'jotai';
import type { ClaimData } from '@/lib/types/claim';

// Tree ID from table visualizer batch evaluation
export const selectedTableTreeIdAtom = atom<string | null>(null);

// Claim data to pre-populate in review-trees
export const selectedTableClaimDataAtom = atom<ClaimData | null>(null);

// Tab to show in review-trees (flexible - can be any tab)
export const selectedTableTabAtom = atom<string>('visualization');

// Flag to indicate if we're coming from table visualizer
export const isFromTableVisualizerAtom = atom(false);
