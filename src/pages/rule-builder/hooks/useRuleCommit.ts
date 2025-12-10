import { useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  ruleBuilderRulesAtom,
  ruleBuilderCurrentEffectAtom,
  magicInputTextAtom,
} from '@/store/atoms/ruleBuilder';
import { validateTokens, generateRuleId } from '../utils/validation';
import type { Token, Rule } from '@/lib/types/ruleBuilder';

interface UseRuleCommitResult {
  commitRule: () => boolean;
  canCommit: boolean;
  validationErrors: string[];
}

/**
 * Hook to validate and commit rules from Magic Input
 */
export function useRuleCommit(tokens: Token[]): UseRuleCommitResult {
  const [rules, setRules] = useAtom(ruleBuilderRulesAtom);
  const currentEffect = useAtomValue(ruleBuilderCurrentEffectAtom);
  const setMagicInputText = useSetAtom(magicInputTextAtom);

  // Validate current tokens
  const validation = validateTokens(tokens, currentEffect);

  const commitRule = useCallback((): boolean => {
    if (!validation.isValid || !validation.parsedRule) {
      return false;
    }

    const newRule: Rule = {
      id: generateRuleId(),
      field: validation.parsedRule.field!,
      operator: validation.parsedRule.operator!,
      value: validation.parsedRule.value ?? null,
      effect: validation.parsedRule.effect!,
    };

    setRules([...rules, newRule]);
    setMagicInputText('');

    return true;
  }, [validation, rules, setRules, setMagicInputText]);

  return {
    commitRule,
    canCommit: validation.isValid,
    validationErrors: validation.errors,
  };
}
