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

interface ClaimWithResult {
  claim: ClaimData;
  result?: TraceResult;
}

// Selected tree ID for evaluation
export const tableVisualizerTreeIdAtom = atomWithStorage<string | null>(
  'tableVisualizer:treeId',
  null
);

// Active tab state
export const tableVisualizerActiveTabAtom = atomWithStorage<string>(
  'tableVisualizer:activeTab',
  'setup'
);

// File metadata (can't store File object, just metadata)
export const tableVisualizerFileMetadataAtom = atomWithStorage<{
  name: string;
  size: number;
} | null>('tableVisualizer:fileMetadata', null);

// Processed claims with results
export const tableVisualizerClaimsWithResultsAtom = atomWithStorage<ClaimWithResult[]>(
  'tableVisualizer:claimsWithResults',
  []
);

// Validation result
export const tableVisualizerValidationAtom = atomWithStorage<ValidationResult | null>(
  'tableVisualizer:validation',
  null
);
