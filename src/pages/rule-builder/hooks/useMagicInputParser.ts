import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { ruleBuilderDimensionsAtom } from '@/store/atoms/ruleBuilder';
import { tokenize, getTokenAtCursor, getAutocompleteContext } from '../utils/tokenizer';
import type { Token, AutocompleteContext } from '@/lib/types/ruleBuilder';

interface ParseResult {
  tokens: Token[];
  currentToken: Token | null;
  context: AutocompleteContext;
  fieldToken: Token | null;
}

/**
 * Hook to parse magic input text and determine autocomplete context
 */
export function useMagicInputParser(text: string, cursorPos: number): ParseResult {
  const dimensions = useAtomValue(ruleBuilderDimensionsAtom);

  // Create set of known field names (lowercase for matching)
  const dimensionNames = useMemo(
    () => new Set(dimensions.map((d) => d.name.toLowerCase())),
    [dimensions]
  );

  // Tokenize the input
  const tokens = useMemo(() => {
    return tokenize(text, dimensionNames);
  }, [text, dimensionNames]);

  // Find token at cursor
  const currentToken = useMemo(() => {
    return getTokenAtCursor(tokens, cursorPos);
  }, [tokens, cursorPos]);

  // Determine autocomplete context
  const context = useMemo((): AutocompleteContext => {
    // If we're in the middle of typing a token, use its type as context
    if (currentToken) {
      if (currentToken.type === 'unknown') {
        // Could be typing a field name
        return 'field';
      }
      return currentToken.type === 'field'
        ? 'field'
        : currentToken.type === 'operator'
        ? 'operator'
        : currentToken.type === 'value'
        ? 'value'
        : 'field';
    }

    // Otherwise, determine what comes next based on completed tokens
    return getAutocompleteContext(tokens);
  }, [currentToken, tokens]);

  // Find the field token (for getting operators/values)
  const fieldToken = useMemo(() => {
    return tokens.find((t) => t.type === 'field') || null;
  }, [tokens]);

  return { tokens, currentToken, context, fieldToken };
}
