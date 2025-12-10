import { useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { supabase } from '@/lib/db/supabase';
import {
  ruleBuilderRulesAtom,
  ruleBuilderDatasetIdAtom,
  ruleBuilderLoadingAtom,
  ruleBuilderErrorAtom,
  resetRuleBuilderAtom,
} from '@/store/atoms/ruleBuilder';
import type { RuleSet } from '@/lib/types/ruleBuilder';

interface UseRuleSetSaveResult {
  saveRuleSet: (name: string) => Promise<RuleSet | null>;
  loadRuleSets: () => Promise<RuleSet[]>;
  deleteRuleSet: (id: string) => Promise<boolean>;
  isSaving: boolean;
  error: string | null;
}

/**
 * Hook to save/load rule sets from Supabase
 */
export function useRuleSetSave(): UseRuleSetSaveResult {
  const rules = useAtomValue(ruleBuilderRulesAtom);
  const datasetId = useAtomValue(ruleBuilderDatasetIdAtom);
  const [loading, setLoading] = useAtom(ruleBuilderLoadingAtom);
  const [error, setError] = useAtom(ruleBuilderErrorAtom);
  const resetRuleBuilder = useSetAtom(resetRuleBuilderAtom);

  const saveRuleSet = useCallback(
    async (name: string): Promise<RuleSet | null> => {
      if (!datasetId) {
        setError('No dataset selected');
        return null;
      }

      if (rules.length === 0) {
        setError('No rules to save');
        return null;
      }

      setLoading((prev) => ({ ...prev, saving: true }));
      setError(null);

      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          throw new Error('Not authenticated');
        }

        const { data, error: insertError } = await supabase
          .from('rule_sets')
          .insert({
            name,
            dataset_id: datasetId,
            rules: rules,
            user_id: userData.user.id,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        // Reset the rule builder after successful save
        resetRuleBuilder();

        return {
          id: data.id,
          name: data.name,
          datasetId: data.dataset_id,
          rules: data.rules,
          userId: data.user_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save rule set';
        setError(message);
        console.error('Failed to save rule set:', err);
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, saving: false }));
      }
    },
    [datasetId, rules, setLoading, setError, resetRuleBuilder]
  );

  const loadRuleSets = useCallback(async (): Promise<RuleSet[]> => {
    if (!datasetId) return [];

    try {
      const { data, error: fetchError } = await supabase
        .from('rule_sets')
        .select('*')
        .eq('dataset_id', datasetId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      return (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        datasetId: row.dataset_id,
        rules: row.rules,
        userId: row.user_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      console.error('Failed to load rule sets:', err);
      return [];
    }
  }, [datasetId]);

  const deleteRuleSet = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase.from('rule_sets').delete().eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      return true;
    } catch (err) {
      console.error('Failed to delete rule set:', err);
      return false;
    }
  }, []);

  return {
    saveRuleSet,
    loadRuleSets,
    deleteRuleSet,
    isSaving: loading.saving,
    error,
  };
}
