import { useCallback, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import {
  ruleBuilderRulesAtom,
  ruleBuilderSaveStatusAtom,
  ruleBuilderLastSavedAtAtom,
} from '@/store/atoms/ruleBuilder';
import { upsertRuleset } from '@/lib/db/operations';

export type SaveStatus = 'saved' | 'saving' | 'error';

interface UseRuleAutoSaveResult {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  save: () => Promise<void>;
}

/**
 * Auto-save hook that triggers save when rules change
 * Saves on rule commit/delete/update (not time-based)
 *
 * @param datasetId - The dataset ID to save rules for
 * @param hasLoaded - Flag from useRuleSetLoad indicating initial load is complete
 */
export function useRuleAutoSave(datasetId: number, hasLoaded: boolean): UseRuleAutoSaveResult {
  const [rules] = useAtom(ruleBuilderRulesAtom);
  const [saveStatus, setSaveStatus] = useAtom(ruleBuilderSaveStatusAtom);
  const [lastSavedAt, setLastSavedAt] = useAtom(ruleBuilderLastSavedAtAtom);

  // Track the rules state after initial load to detect actual changes
  const initialRulesRef = useRef<string | null>(null);
  const hasRecordedInitialState = useRef(false);

  // Record the initial rules state once loading is complete
  useEffect(() => {
    if (hasLoaded && !hasRecordedInitialState.current) {
      initialRulesRef.current = JSON.stringify(rules);
      hasRecordedInitialState.current = true;
    }
  }, [hasLoaded, rules]);

  // Reset when datasetId changes
  useEffect(() => {
    hasRecordedInitialState.current = false;
    initialRulesRef.current = null;
  }, [datasetId]);

  const save = useCallback(async () => {
    if (!datasetId) return;

    setSaveStatus('saving');
    try {
      await upsertRuleset(datasetId, rules);
      setSaveStatus('saved');
      setLastSavedAt(new Date());
    } catch (error) {
      console.error('Failed to save ruleset:', error);
      setSaveStatus('error');
    }
  }, [datasetId, rules, setSaveStatus, setLastSavedAt]);

  // Save when rules change (but only after initial load is complete)
  useEffect(() => {
    // Don't save until load is complete and we've recorded initial state
    if (!hasLoaded || !hasRecordedInitialState.current) {
      return;
    }

    // Check if rules actually changed from what was loaded
    const currentRulesStr = JSON.stringify(rules);
    if (currentRulesStr === initialRulesRef.current) {
      // No actual change from loaded state
      return;
    }

    // Update the reference and save
    initialRulesRef.current = currentRulesStr;
    save();
  }, [rules, hasLoaded, save]);

  return { saveStatus, lastSavedAt, save };
}
