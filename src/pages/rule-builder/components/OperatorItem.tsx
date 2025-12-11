import { useSetAtom, useAtom } from 'jotai';
import { GripVertical } from 'lucide-react';
import { draggedItemAtom, magicInputTextAtom } from '@/store/atoms/ruleBuilder';
import type { OperatorDefinition } from '@/lib/types/ruleBuilder';

interface OperatorItemProps {
  operator: OperatorDefinition;
  disabled?: boolean;
}

export function OperatorItem({ operator, disabled }: OperatorItemProps) {
  const setDraggedItem = useSetAtom(draggedItemAtom);
  const [magicInputText, setMagicInputText] = useAtom(magicInputTextAtom);

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', operator.symbol);
    setDraggedItem({
      type: 'operator',
      value: operator.symbol,
      displayValue: operator.name,
    });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDoubleClick = () => {
    if (disabled) return;
    // Insert operator at end of input with spaces
    const newText = magicInputText.trim()
      ? `${magicInputText.trim()} ${operator.symbol} `
      : `${operator.symbol} `;
    setMagicInputText(newText);
  };

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDoubleClick={handleDoubleClick}
      className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors group select-none ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-grab hover:bg-zinc-800'
      }`}
      title={operator.name}
    >
      <GripVertical
        className={`h-3 w-3 text-zinc-600 flex-shrink-0 transition-opacity ${
          disabled ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
        }`}
      />
      <span className="text-xs text-zinc-300 flex-1">{operator.name}</span>
    </div>
  );
}
