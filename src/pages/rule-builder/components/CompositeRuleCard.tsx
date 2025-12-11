import { useAtomValue } from 'jotai';
import { X, AlertTriangle, XOctagon, GripVertical } from 'lucide-react';
import { ruleBuilderDimensionsAtom } from '@/store/atoms/ruleBuilder';
import { getOperatorBySymbol } from '../utils/operators';
import type { CompositeRule, DimensionDataType } from '@/lib/types/ruleBuilder';

interface CompositeRuleCardProps {
  rule: CompositeRule;
  onDelete: () => void;
}

const VALUE_COLORS: Record<DimensionDataType, string> = {
  Number: 'bg-teal-600',
  String: 'bg-blue-600',
  Boolean: 'bg-purple-600',
  Date: 'bg-zinc-600',
};

export function CompositeRuleCard({ rule, onDelete }: CompositeRuleCardProps) {
  const dimensions = useAtomValue(ruleBuilderDimensionsAtom);

  // Format value for display
  const formatValue = (value: string | number | boolean | null): string => {
    if (value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  return (
    <div
      className="rounded-lg border transition-colors hover:border-zinc-600 group"
      style={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
    >
      {/* Header with drag handle and effect badge */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
          <span className="text-xs text-zinc-500">
            {rule.conditions.length} conditions
          </span>
        </div>

        <div className="flex items-center gap-2">
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
      </div>

      {/* Conditions stack */}
      <div className="px-4 py-3">
        {rule.conditions.map((condition, index) => {
          const dimension = dimensions.find((d) => d.name === condition.field);
          const operator = getOperatorBySymbol(condition.operator);
          const valueColor = dimension ? VALUE_COLORS[dimension.dataType] : 'bg-zinc-600';

          return (
            <div key={index}>
              {/* Condition row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Field pill */}
                <span className="px-2 py-1 text-xs font-medium bg-zinc-700 text-zinc-200 rounded">
                  {dimension?.displayName || condition.field}
                </span>

                {/* Operator */}
                <span className="text-xs text-zinc-400 font-mono">
                  {operator?.name || condition.operator}
                </span>

                {/* Value pill (if present) */}
                {condition.value !== null && condition.value !== undefined && (
                  <span className={`px-2 py-1 text-xs font-mono text-white rounded ${valueColor}`}>
                    {formatValue(condition.value)}
                  </span>
                )}
              </div>

              {/* Connector to next condition */}
              {condition.connector && index < rule.conditions.length - 1 && (
                <div className="flex items-center gap-2 my-2 ml-4">
                  <div className="w-px h-3 bg-zinc-700" />
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                      condition.connector === 'OR'
                        ? 'bg-purple-900/30 text-purple-400'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {condition.connector}
                  </span>
                  <div className="w-px h-3 bg-zinc-700" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
