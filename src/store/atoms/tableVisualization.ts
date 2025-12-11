import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { ClaimData } from '@/lib/types/claim';
import type { TraceResult } from '@/lib/types/trace';
import type { RuleExecutionResult } from '@/lib/types/ruleExecution';
import type { ValidationResult } from '@/lib/processing/TabularClaimsProcessor';

// ===== Analysis Mode =====
// Trees mode: use decision trees for evaluation (raw datasets + CSV uploads)
// Rules mode: use business rules for evaluation (aligned datasets only)
export type AnalysisMode = 'trees' | 'rules';

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

// Tree mode result
export interface ClaimWithTreeResult {
  claim: ClaimData;
  result?: TraceResult;
}

// Rule mode result
export interface ClaimWithRuleResult {
  claim: ClaimData;
  result?: RuleExecutionResult;
}

// Combined type for backwards compatibility
export interface ClaimWithResult {
  claim: ClaimData;
  result?: TraceResult;
  ruleResult?: RuleExecutionResult;
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

// ===== Analysis Mode State =====
// Analysis mode - trees or rules (persisted separately)
export const tableVisualizerAnalysisModeAtom = atomWithStorage<AnalysisMode>(
  'tableVisualizer:analysisMode',
  'trees'
);

// Selected dataset ID (for rules mode - needed to load aligned dataset)
export const tableVisualizerDatasetIdAtom = atomWithStorage<number | null>(
  'tableVisualizer:datasetId',
  null
);

// Rules mode: processed claims with rule results
export const tableVisualizerRuleResultsAtom = atomWithStorage<ClaimWithRuleResult[]>(
  'tableVisualizer:ruleResults',
  []
);
