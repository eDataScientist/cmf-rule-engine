import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { ClaimData } from '@/lib/types/claim';
import type { TraceResult } from '@/lib/types/trace';
import type { ValidationResult } from '@/lib/processing/TabularClaimsProcessor';

// ===== Navigation Atoms (for review-trees) =====
// Tree ID from table visualizer batch evaluation
export const selectedTableTreeIdAtom = atom<string | null>(null);

// Claim data to pre-populate in review-trees
export const selectedTableClaimDataAtom = atom<ClaimData | null>(null);

// Tab to show in review-trees (flexible - can be any tab)
export const selectedTableTabAtom = atom<string>('visualization');

// Flag to indicate if we're coming from table visualizer
export const isFromTableVisualizerAtom = atom(false);

// ===== Table Visualizer State Cache =====
// Persisted state so users don't lose progress when navigating away

export interface ClaimWithResult {
  claim: ClaimData;
  result?: TraceResult;
}

// Selected tree ID for evaluation
export const tableVisualizerTreeIdAtom = atomWithStorage<string | null>(
  'tableVisualizer:treeId',
  null
);

// View mode (replaces activeTab) - analytics or table view
export const tableVisualizerViewModeAtom = atomWithStorage<'analytics' | 'table'>(
  'tableVisualizer:viewMode',
  'analytics'
);

// Selected claim index for trace inspector
export const tableVisualizerSelectedClaimIndexAtom = atomWithStorage<number | null>(
  'tableVisualizer:selectedClaimIndex',
  null
);

// Search query for filtering claims
export const tableVisualizerSearchQueryAtom = atomWithStorage<string>(
  'tableVisualizer:searchQuery',
  ''
);

// Panel sizes [top%, bottom%]
export const tableVisualizerPanelSizesAtom = atomWithStorage<[number, number]>(
  'tableVisualizer:panelSizes',
  [60, 40]
);

// File metadata (can't store File object, just metadata)
export const tableVisualizerFileMetadataAtom = atomWithStorage<{
  name: string;
  size: number;
} | null>('tableVisualizer:fileMetadata', null);

// Processed claims with results (NOT persisted - too large for localStorage)
export const tableVisualizerClaimsWithResultsAtom = atom<ClaimWithResult[]>([]);

// Validation result (NOT persisted - can be large and is tied to uploaded file)
export const tableVisualizerValidationAtom = atom<ValidationResult | null>(null);
