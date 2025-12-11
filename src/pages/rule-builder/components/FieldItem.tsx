import { useSetAtom, useAtom } from 'jotai';
import { GripVertical } from 'lucide-react';
import { draggedItemAtom, magicInputTextAtom } from '@/store/atoms/ruleBuilder';
import type { RuleBuilderDimension } from '@/lib/types/ruleBuilder';

interface FieldItemProps {
  dimension: RuleBuilderDimension;
}

export function FieldItem({ dimension }: FieldItemProps) {
  const setDraggedItem = useSetAtom(draggedItemAtom);
  const [magicInputText, setMagicInputText] = useAtom(magicInputTextAtom);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', dimension.name);
    setDraggedItem({
      type: 'field',
      value: dimension.name,
      displayValue: dimension.displayName,
      dataType: dimension.dataType,
    });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDoubleClick = () => {
    // Insert field at end of input with a space
    const newText = magicInputText.trim()
      ? `${magicInputText.trim()} ${dimension.name} `
      : `${dimension.name} `;
    setMagicInputText(newText);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDoubleClick={handleDoubleClick}
      className="flex items-center gap-2 px-2 py-1.5 rounded cursor-grab hover:bg-zinc-800 transition-colors group select-none"
      title={`${dimension.displayName} (${dimension.dataType})${dimension.isCritical ? ' - Critical' : ''}`}
    >
      <GripVertical className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      <span className="text-xs text-zinc-300 truncate flex-1 font-medium">
        {dimension.displayName}
      </span>
      {dimension.isCritical && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"
          title="Critical field"
        />
      )}
    </div>
  );
}
