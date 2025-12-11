import { useAtomValue } from 'jotai';
import { X, AlertTriangle, XOctagon, GripVertical } from 'lucide-react';
import { ruleBuilderDimensionsAtom } from '@/store/atoms/ruleBuilder';
import { getOperatorBySymbol } from '../utils/operators';
import type { Rule, DimensionDataType } from '@/lib/types/ruleBuilder';

interface RuleCardProps {
  rule: Rule;
  onDelete: () => void;
}

const VALUE_COLORS: Record<DimensionDataType, string> = {
  Number: 'bg-teal-600',
  String: 'bg-blue-600',
  Boolean: 'bg-purple-600',
  Date: 'bg-zinc-600',
};

export function RuleCard({ rule, onDelete }: RuleCardProps) {
  const dimensions = useAtomValue(ruleBuilderDimensionsAtom);

  // Find dimension info
  const dimension = dimensions.find((d) => d.name === rule.field);
  const operator = getOperatorBySymbol(rule.operator);
  const valueColor = dimension ? VALUE_COLORS[dimension.dataType] : 'bg-zinc-600';

  // Format value for display
  const formatValue = (value: string | number | boolean | null): string => {
    if (value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors hover:border-zinc-600 group"
      style={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
    >
      {/* Drag handle */}
      <GripVertical className="h-4 w-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab flex-shrink-0" />

      {/* Rule content */}
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        {/* Field pill */}
        <span className="px-2 py-1 text-xs font-medium bg-zinc-700 text-zinc-200 rounded">
          {dimension?.displayName || rule.field}
        </span>

        {/* Operator */}
        <span className="text-xs text-zinc-400 font-mono">{operator?.name || rule.operator}</span>

        {/* Value pill (if present) */}
        {rule.value !== null && rule.value !== undefined && (
          <span className={`px-2 py-1 text-xs font-mono text-white rounded ${valueColor}`}>
            {formatValue(rule.value)}
          </span>
        )}
      </div>

      {/* Effect badge */}
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
          rule.effect === 'high'
            ? 'bg-red-500/20 text-red-400'
            : 'bg-amber-500/20 text-amber-400'
        }`}
      >
        {rule.effect === 'high' ? (
          <XOctagon className="h-3 w-3" />
        ) : (
          <AlertTriangle className="h-3 w-3" />
        )}
        <span>{rule.effect === 'high' ? 'High' : 'Moderate'}</span>
      </div>

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="p-1 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        title="Delete rule"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
