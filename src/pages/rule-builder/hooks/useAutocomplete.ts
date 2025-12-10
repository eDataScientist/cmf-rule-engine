import { useMemo, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { ruleBuilderDimensionsAtom } from '@/store/atoms/ruleBuilder';
import { useDistinctValues } from './useDistinctValues';
import { OPERATORS, getOperatorsForType } from '../utils/operators';
import type {
  Token,
  AutocompleteSuggestion,
  AutocompleteContext,
  RuleBuilderDimension,
} from '@/lib/types/ruleBuilder';

interface AutocompleteResult {
  suggestions: AutocompleteSuggestion[];
  isLoading: boolean;
}

/**
 * Hook to generate autocomplete suggestions based on context
 */
export function useAutocomplete(
  context: AutocompleteContext,
  currentToken: Token | null,
  fieldToken: Token | null,
  _allTokens: Token[]
): AutocompleteResult {
  const dimensions = useAtomValue(ruleBuilderDimensionsAtom);
  const { fetchDistinctValues, isLoading: loadingValues } = useDistinctValues();
  const [valueSuggestions, setValueSuggestions] = useState<string[]>([]);

  // Get the partial text being typed (for filtering)
  const prefix = currentToken?.value.toLowerCase() || '';

  // Find the dimension for the current field
  const currentDimension = useMemo((): RuleBuilderDimension | null => {
    if (!fieldToken) return null;
    return (
      dimensions.find((d) => d.name.toLowerCase() === fieldToken.value.toLowerCase()) || null
    );
  }, [fieldToken, dimensions]);

  // Fetch distinct values when context is 'value' and field is string type
  useEffect(() => {
    if (context !== 'value' || !currentDimension) {
      setValueSuggestions([]);
      return;
    }

    if (currentDimension.dataType !== 'String') {
      setValueSuggestions([]);
      return;
    }

    fetchDistinctValues(currentDimension.name).then((values) => {
      setValueSuggestions(values || []);
    });
  }, [context, currentDimension, fetchDistinctValues]);

  // Generate suggestions based on context
  const suggestions = useMemo((): AutocompleteSuggestion[] => {
    switch (context) {
      case 'field':
        return dimensions
          .filter((d) => d.name.toLowerCase().includes(prefix) || d.displayName.toLowerCase().includes(prefix))
          .slice(0, 15)
          .map((d) => ({
            type: 'field',
            value: d.name,
            displayValue: d.displayName,
            description: d.dataType,
            dataType: d.dataType,
          }));

      case 'operator':
        // Get operators applicable for the field's data type
        const applicableOps = currentDimension
          ? getOperatorsForType(currentDimension.dataType)
          : OPERATORS;

        return applicableOps
          .filter(
            (op) =>
              op.symbol.toLowerCase().includes(prefix) || op.name.toLowerCase().includes(prefix)
          )
          .map((op) => ({
            type: 'operator',
            value: op.symbol,
            displayValue: op.name,
            description: undefined,
          }));

      case 'value':
        // For string fields, show distinct values
        if (currentDimension?.dataType === 'String' && valueSuggestions.length > 0) {
          return valueSuggestions
            .filter((v) => v.toLowerCase().includes(prefix))
            .slice(0, 10)
            .map((v) => ({
              type: 'value',
              value: `"${v}"`,
              displayValue: v,
            }));
        }

        // For boolean fields
        if (currentDimension?.dataType === 'Boolean') {
          return ([
            { type: 'value' as const, value: 'true', displayValue: 'true', description: 'Boolean true' },
            { type: 'value' as const, value: 'false', displayValue: 'false', description: 'Boolean false' },
          ] as AutocompleteSuggestion[]).filter((s) => s.value.includes(prefix));
        }

        // For numbers/dates, no suggestions
        return [];

      case 'connector':
        return ([
          {
            type: 'connector' as const,
            value: 'AND',
            displayValue: 'AND',
            description: undefined,
          },
          {
            type: 'connector' as const,
            value: 'OR',
            displayValue: 'OR',
            description: undefined,
          },
        ] as AutocompleteSuggestion[]).filter((s) => s.value.toLowerCase().includes(prefix));

      default:
        return [];
    }
  }, [context, prefix, dimensions, currentDimension, valueSuggestions]);

  return { suggestions, isLoading: loadingValues };
}
