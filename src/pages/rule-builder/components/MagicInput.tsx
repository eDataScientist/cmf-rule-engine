import { useRef, useCallback, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { CornerDownLeft, Loader2 } from 'lucide-react';
import {
  magicInputTextAtom,
  magicInputCursorAtom,
  autocompleteVisibleAtom,
  autocompleteIndexAtom,
  dropTargetActiveAtom,
  draggedItemAtom,
  ruleBuilderCurrentEffectAtom,
} from '@/store/atoms/ruleBuilder';
import { useMagicInputParser } from '../hooks/useMagicInputParser';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { useRuleCommit } from '../hooks/useRuleCommit';
import { Autocomplete } from './Autocomplete';

export function MagicInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useAtom(magicInputTextAtom);
  const [cursorPos, setCursorPos] = useAtom(magicInputCursorAtom);
  const [autocompleteVisible, setAutocompleteVisible] = useAtom(autocompleteVisibleAtom);
  const [autocompleteIndex, setAutocompleteIndex] = useAtom(autocompleteIndexAtom);
  const dropTargetActive = useAtomValue(dropTargetActiveAtom);
  const draggedItem = useAtomValue(draggedItemAtom);
  const setDropTargetActive = useSetAtom(dropTargetActiveAtom);
  const currentEffect = useAtomValue(ruleBuilderCurrentEffectAtom);

  const { tokens, currentToken, context, fieldToken } = useMagicInputParser(text, cursorPos);
  const { suggestions, isLoading } = useAutocomplete(context, currentToken, fieldToken, tokens);
  const { commitRule, canCommit } = useRuleCommit(tokens);

  // Show autocomplete when there are suggestions and user is typing
  useEffect(() => {
    const shouldShow = suggestions.length > 0 && text.length > 0;
    setAutocompleteVisible(shouldShow);
    if (shouldShow) {
      setAutocompleteIndex(0);
    }
  }, [suggestions.length, text, setAutocompleteVisible, setAutocompleteIndex]);

  const insertSuggestion = useCallback(
    (value: string) => {
      if (!currentToken) {
        setText(text + value + ' ');
      } else {
        const before = text.slice(0, currentToken.start);
        const after = text.slice(currentToken.end);
        setText(before + value + ' ' + after.trimStart());
      }
      setAutocompleteVisible(false);
      inputRef.current?.focus();
    },
    [currentToken, text, setText, setAutocompleteVisible]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Handle autocomplete navigation
      if (autocompleteVisible && suggestions.length > 0) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setAutocompleteIndex((i) => Math.min(i + 1, suggestions.length - 1));
            return;
          case 'ArrowUp':
            e.preventDefault();
            setAutocompleteIndex((i) => Math.max(i - 1, 0));
            return;
          case 'Tab':
            e.preventDefault();
            if (suggestions[autocompleteIndex]) {
              insertSuggestion(suggestions[autocompleteIndex].value);
            }
            return;
          case 'Escape':
            e.preventDefault();
            setAutocompleteVisible(false);
            return;
          case 'Enter':
            e.preventDefault();
            if (suggestions[autocompleteIndex]) {
              insertSuggestion(suggestions[autocompleteIndex].value);
            }
            return;
        }
      }

      // Submit rule on Enter when valid
      if (e.key === 'Enter' && canCommit) {
        e.preventDefault();
        commitRule();
      }
    },
    [
      autocompleteVisible,
      suggestions,
      autocompleteIndex,
      canCommit,
      setAutocompleteIndex,
      setAutocompleteVisible,
      insertSuggestion,
      commitRule,
    ]
  );

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDropTargetActive(false);

      if (draggedItem) {
        const newText = text.trim() ? `${text.trim()} ${draggedItem.value} ` : `${draggedItem.value} `;
        setText(newText);
        inputRef.current?.focus();
      }
    },
    [draggedItem, text, setText, setDropTargetActive]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDropTargetActive(true);
    },
    [setDropTargetActive]
  );

  const handleDragLeave = useCallback(() => {
    setDropTargetActive(false);
  }, [setDropTargetActive]);

  return (
    <div className="relative">
      {/* Input container */}
      <div
        className={`flex items-center h-12 px-4 rounded-lg border transition-all ${
          dropTargetActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-zinc-700 bg-black hover:border-zinc-600'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onSelect={(e) => setCursorPos(e.currentTarget.selectionStart || 0)}
          placeholder="Type a rule... (e.g., ClaimAmount > 10000)"
          className="flex-1 bg-transparent outline-none text-sm text-zinc-100 placeholder:text-zinc-600"
          style={{ fontFamily: 'JetBrains Mono, Consolas, monospace' }}
          autoComplete="off"
          spellCheck={false}
        />

        {isLoading && <Loader2 className="h-4 w-4 text-zinc-500 animate-spin mr-2" />}

        {/* Effect indicator */}
        <div
          className={`px-2 py-0.5 rounded text-[10px] font-medium mr-2 ${
            currentEffect === 'high'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-amber-500/20 text-amber-400'
          }`}
        >
          {currentEffect === 'high' ? 'High Risk' : 'Moderate'}
        </div>

        {/* Submit button */}
        {canCommit ? (
          <button
            onClick={() => commitRule()}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white text-black rounded hover:bg-zinc-200 transition-colors"
          >
            Add
            <CornerDownLeft className="h-3 w-3" />
          </button>
        ) : (
          <div className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-500">
            <CornerDownLeft className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {autocompleteVisible && suggestions.length > 0 && (
        <Autocomplete
          suggestions={suggestions}
          selectedIndex={autocompleteIndex}
          onSelect={insertSuggestion}
          context={context}
        />
      )}
    </div>
  );
}
