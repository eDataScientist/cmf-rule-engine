import { useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  ruleBuilderRulesAtom,
  ruleBuilderCurrentEffectAtom,
  magicInputTextAtom,
} from '@/store/atoms/ruleBuilder';
import { validateTokens, generateRuleId } from '../utils/validation';
import type { Token, Rule, CompositeRule, RuleItem } from '@/lib/types/ruleBuilder';

interface UseRuleCommitResult {
  commitRule: () => boolean;
  canCommit: boolean;
  validationErrors: string[];
  conditionCount: number;
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
    if (!validation.isValid || validation.parsedRules.length === 0) {
      return false;
    }

    let newRule: RuleItem;

    if (validation.parsedRules.length === 1) {
      // Single condition - create a simple Rule
      const parsed = validation.parsedRules[0];
      newRule = {
        id: generateRuleId(),
        field: parsed.field!,
        operator: parsed.operator!,
        value: parsed.value ?? null,
        effect: parsed.effect!,
      } as Rule;
    } else {
      // Multiple conditions - create a CompositeRule
      newRule = {
        id: generateRuleId(),
        conditions: validation.parsedRules.map((parsed, index) => ({
          field: parsed.field!,
          operator: parsed.operator!,
          value: parsed.value ?? null,
          // Connector links to the NEXT condition, so last one has no connector
          connector: index < validation.parsedRules.length - 1 ? parsed.connector : undefined,
        })),
        effect: currentEffect,
      } as CompositeRule;
    }

    setRules([...rules, newRule]);
    setMagicInputText('');

    return true;
  }, [validation, rules, setRules, setMagicInputText, currentEffect]);

  return {
    commitRule,
    canCommit: validation.isValid,
    validationErrors: validation.errors,
    conditionCount: validation.parsedRules.length,
  };
}
