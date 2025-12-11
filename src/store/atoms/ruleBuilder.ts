import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type {
  RuleItem,
  RuleBuilderDimension,
  RuleEffect,
  RuleConnector,
  GroupedDimensions,
  Token,
  DraggedItem,
  AutocompleteContext,
} from '@/lib/types/ruleBuilder';

// ===== Persisted State =====

// Selected dataset ID for the rule builder
export const ruleBuilderDatasetIdAtom = atomWithStorage<number | null>(
  'ruleBuilder:datasetId',
  null
);

// Committed rules in the logic stack
export const ruleBuilderRulesAtom = atomWithStorage<RuleItem[]>(
  'ruleBuilder:rules',
  []
);

// Default connector for new rules
export const ruleBuilderDefaultConnectorAtom = atomWithStorage<RuleConnector>(
  'ruleBuilder:defaultConnector',
  'AND'
);

// Current effect selection (required for new rules)
export const ruleBuilderCurrentEffectAtom = atomWithStorage<RuleEffect>(
  'ruleBuilder:currentEffect',
  'moderate'
);

// Rule set name (for saving)
export const ruleBuilderRuleSetNameAtom = atomWithStorage<string>(
  'ruleBuilder:ruleSetName',
  ''
);

// ===== Session State (not persisted) =====

// Cached dimensions for datasets (keyed by dataset_id)
export const ruleBuilderDimensionsCacheAtom = atom<Map<number, RuleBuilderDimension[]>>(
  new Map()
);

// Current dataset's dimensions (derived)
export const ruleBuilderDimensionsAtom = atom<RuleBuilderDimension[]>((get) => {
  const datasetId = get(ruleBuilderDatasetIdAtom);
  const cache = get(ruleBuilderDimensionsCacheAtom);
  if (!datasetId) return [];
  return cache.get(datasetId) || [];
});

// Grouped dimensions for palette display (derived)
export const ruleBuilderGroupedDimensionsAtom = atom<GroupedDimensions>((get) => {
  const dimensions = get(ruleBuilderDimensionsAtom);
  return {
    Number: dimensions.filter((d) => d.dataType === 'Number'),
    String: dimensions.filter((d) => d.dataType === 'String'),
    Date: dimensions.filter((d) => d.dataType === 'Date'),
    Boolean: dimensions.filter((d) => d.dataType === 'Boolean'),
  };
});

// Loading states
export const ruleBuilderLoadingAtom = atom<{
  dimensions: boolean;
  distinctValues: boolean;
  saving: boolean;
}>({
  dimensions: false,
  distinctValues: false,
  saving: false,
});

// Error state
export const ruleBuilderErrorAtom = atom<string | null>(null);

// ===== Magic Input State =====

// Raw input text
export const magicInputTextAtom = atom<string>('');

// Parsed tokens from input
export const magicInputTokensAtom = atom<Token[]>([]);

// Cursor position in the input
export const magicInputCursorAtom = atom<number>(0);

// Autocomplete visibility
export const autocompleteVisibleAtom = atom<boolean>(false);

// Selected autocomplete index
export const autocompleteIndexAtom = atom<number>(0);

// Current autocomplete context
export const autocompleteContextAtom = atom<AutocompleteContext>('field');

// ===== Distinct Values Cache =====

// Cached distinct values for string columns (keyed by `${datasetId}:${columnName}`)
export const distinctValuesCacheAtom = atom<Map<string, string[] | null>>(
  new Map()
);

// ===== Drag & Drop State =====

// Currently dragged item
export const draggedItemAtom = atom<DraggedItem | null>(null);

// Whether drop target is active
export const dropTargetActiveAtom = atom<boolean>(false);

// ===== Rule Editing State =====

// ID of rule currently being edited (null = creating new)
export const editingRuleIdAtom = atom<string | null>(null);

// ===== Derived Atoms =====

// Check if there are unsaved changes
export const hasUnsavedChangesAtom = atom<boolean>((get) => {
  const rules = get(ruleBuilderRulesAtom);
  return rules.length > 0;
});

// Count of rules
export const ruleCountAtom = atom<number>((get) => {
  const rules = get(ruleBuilderRulesAtom);
  return rules.length;
});

// ===== Action Atoms (write-only) =====

// Clear all rules
export const clearRulesAtom = atom(null, (_get, set) => {
  set(ruleBuilderRulesAtom, []);
  set(magicInputTextAtom, '');
  set(editingRuleIdAtom, null);
});

// Add a new rule
export const addRuleAtom = atom(null, (get, set, rule: RuleItem) => {
  const currentRules = get(ruleBuilderRulesAtom);
  set(ruleBuilderRulesAtom, [...currentRules, rule]);
});

// Remove a rule by ID
export const removeRuleAtom = atom(null, (get, set, ruleId: string) => {
  const currentRules = get(ruleBuilderRulesAtom);
  set(
    ruleBuilderRulesAtom,
    currentRules.filter((r) => r.id !== ruleId)
  );
});

// Update a rule by ID
export const updateRuleAtom = atom(
  null,
  (get, set, { id, updates }: { id: string; updates: Partial<RuleItem> }) => {
    const currentRules = get(ruleBuilderRulesAtom);
    set(
      ruleBuilderRulesAtom,
      currentRules.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ) as RuleItem[]
    );
  }
);

// Reset the rule builder state
export const resetRuleBuilderAtom = atom(null, (_get, set) => {
  set(ruleBuilderRulesAtom, []);
  set(magicInputTextAtom, '');
  set(editingRuleIdAtom, null);
  set(ruleBuilderErrorAtom, null);
  set(ruleBuilderRuleSetNameAtom, '');
});
