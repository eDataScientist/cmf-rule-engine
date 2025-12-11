import type { Token, TokenType } from '@/lib/types/ruleBuilder';
import { OPERATOR_SYMBOLS } from './operators';

const CONNECTORS = ['AND', 'OR'];

// Multi-character operators must be checked first (longest match)
const SORTED_OPERATORS = [...OPERATOR_SYMBOLS].sort((a, b) => b.length - a.length);

/**
 * Tokenize magic input text into structured tokens
 */
export function tokenize(text: string, knownFields: Set<string>): Token[] {
  const tokens: Token[] = [];
  let pos = 0;

  while (pos < text.length) {
    // Skip whitespace
    if (/\s/.test(text[pos])) {
      pos++;
      continue;
    }

    // Check for quoted string (single or double quotes)
    if (text[pos] === '"' || text[pos] === "'") {
      const quote = text[pos];
      const start = pos;
      pos++; // consume opening quote

      while (pos < text.length && text[pos] !== quote) {
        // Handle escaped quotes
        if (text[pos] === '\\' && pos + 1 < text.length) {
          pos += 2;
        } else {
          pos++;
        }
      }

      if (pos < text.length) {
        pos++; // consume closing quote
      }

      tokens.push({
        type: 'value',
        value: text.slice(start, pos),
        start,
        end: pos,
      });
      continue;
    }

    // Check for operators (multi-char first)
    let foundOp = false;
    for (const op of SORTED_OPERATORS) {
      const slice = text.slice(pos, pos + op.length).toLowerCase();
      if (slice === op.toLowerCase()) {
        // Make sure it's not part of a larger word (for text operators)
        const nextChar = text[pos + op.length];
        if (op.length > 2 && nextChar && /\w/.test(nextChar)) {
          continue; // Skip, it's part of a word
        }

        tokens.push({
          type: 'operator',
          value: op,
          start: pos,
          end: pos + op.length,
        });
        pos += op.length;
        foundOp = true;
        break;
      }
    }
    if (foundOp) continue;

    // Check for connectors (AND, OR)
    let foundConn = false;
    for (const conn of CONNECTORS) {
      const slice = text.slice(pos, pos + conn.length).toUpperCase();
      if (slice === conn) {
        // Make sure it's a complete word
        const nextChar = text[pos + conn.length];
        if (!nextChar || /\s/.test(nextChar)) {
          tokens.push({
            type: 'connector',
            value: conn,
            start: pos,
            end: pos + conn.length,
          });
          pos += conn.length;
          foundConn = true;
          break;
        }
      }
    }
    if (foundConn) continue;

    // Read word/number/identifier
    const start = pos;
    while (pos < text.length && !/\s/.test(text[pos]) && !/[<>=!]/.test(text[pos])) {
      pos++;
    }

    if (pos > start) {
      const value = text.slice(start, pos);
      let type: TokenType = 'unknown';

      // Check if it's a known field
      if (knownFields.has(value.toLowerCase())) {
        type = 'field';
      } else if (!isNaN(Number(value))) {
        // It's a number
        type = 'value';
      } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
        // It's a boolean
        type = 'value';
      }

      tokens.push({ type, value, start, end: pos });
    }
  }

  return tokens;
}

/**
 * Find the token at or near the cursor position
 */
export function getTokenAtCursor(tokens: Token[], cursorPos: number): Token | null {
  for (const token of tokens) {
    if (cursorPos >= token.start && cursorPos <= token.end) {
      return token;
    }
  }
  return null;
}

/**
 * Get the partial text being typed (for autocomplete filtering)
 */
export function getPartialText(text: string, cursorPos: number): string {
  // Find the start of the current word
  let start = cursorPos;
  while (start > 0 && !/\s/.test(text[start - 1])) {
    start--;
  }
  return text.slice(start, cursorPos);
}

/**
 * Determine autocomplete context based on tokens
 */
export function getAutocompleteContext(tokens: Token[]): 'field' | 'operator' | 'value' | 'connector' | 'none' {
  if (tokens.length === 0) return 'field';

  const lastToken = tokens[tokens.length - 1];

  switch (lastToken.type) {
    case 'field':
      return 'operator';
    case 'operator':
      return 'value';
    case 'value':
      return 'connector';
    case 'connector':
      return 'field';
    default:
      return 'field';
  }
}
