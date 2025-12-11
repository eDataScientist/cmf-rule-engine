import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { ruleBuilderDimensionsAtom } from '@/store/atoms/ruleBuilder';
import { tokenize, getTokenAtCursor } from '../utils/tokenizer';
import { validateSyntax, getExpectedTokenType } from '../utils/validation';
import type { Token, AutocompleteContext } from '@/lib/types/ruleBuilder';

interface ParseResult {
  tokens: Token[];
  currentToken: Token | null;
  context: AutocompleteContext;
  fieldToken: Token | null;
  isValidSyntax: boolean;
  syntaxError?: string;
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
  const rawTokens = useMemo(() => {
    return tokenize(text, dimensionNames);
  }, [text, dimensionNames]);

  // Validate syntax and get tokens with error markers
  const { isValid: isValidSyntax, tokens, errorMessage: syntaxError } = useMemo(() => {
    return validateSyntax(rawTokens, dimensionNames);
  }, [rawTokens, dimensionNames]);

  // Find token at cursor
  const currentToken = useMemo(() => {
    return getTokenAtCursor(tokens, cursorPos);
  }, [tokens, cursorPos]);

  // Determine autocomplete context based on grammar
  const context = useMemo((): AutocompleteContext => {
    // If cursor is inside a token, use that token's type as context
    // This ensures we show suggestions for the token being typed
    if (currentToken) {
      switch (currentToken.type) {
        case 'field':
          return 'field';
        case 'operator':
          return 'operator';
        case 'value':
          return 'value';
        case 'connector':
          return 'connector';
        case 'unknown':
          // For unknown tokens, determine what we expect at this position
          // by looking at tokens strictly before this one
          const tokensBefore = tokens.filter(t => t.end < currentToken.start);
          const expected = getExpectedTokenType(tokensBefore);
          if (expected === 'connector_or_end') return 'connector';
          return expected;
      }
    }

    // If cursor is not inside a token (in whitespace), determine next expected
    const tokensBeforeCursor = tokens.filter(t => t.end <= cursorPos);
    const expected = getExpectedTokenType(tokensBeforeCursor);

    // Map expected type to autocomplete context
    switch (expected) {
      case 'field':
        return 'field';
      case 'operator':
        return 'operator';
      case 'value':
        return 'value';
      case 'connector_or_end':
        return 'connector';
      default:
        return 'field';
    }
  }, [tokens, cursorPos, currentToken]);

  // Find the most recent field token (for getting operators/values)
  const fieldToken = useMemo(() => {
    // Get tokens before cursor
    const tokensBeforeCursor = tokens.filter(t => t.end <= cursorPos);
    // Find last field token before cursor
    for (let i = tokensBeforeCursor.length - 1; i >= 0; i--) {
      if (tokensBeforeCursor[i].type === 'field') {
        return tokensBeforeCursor[i];
      }
    }
    return null;
  }, [tokens, cursorPos]);

  return { tokens, currentToken, context, fieldToken, isValidSyntax, syntaxError };
}
