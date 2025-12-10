import { useAtomValue } from 'jotai';
import { Hash, Type, Calendar, ToggleLeft, Loader2 } from 'lucide-react';
import { FieldItem } from './FieldItem';
import {
  ruleBuilderGroupedDimensionsAtom,
  ruleBuilderLoadingAtom,
  ruleBuilderDatasetIdAtom,
} from '@/store/atoms/ruleBuilder';
import type { DimensionDataType } from '@/lib/types/ruleBuilder';

const TYPE_CONFIG: Record<DimensionDataType, { icon: typeof Hash; color: string; label: string }> = {
  Number: { icon: Hash, color: 'text-emerald-400', label: 'Numbers' },
  String: { icon: Type, color: 'text-amber-300', label: 'Strings' },
  Date: { icon: Calendar, color: 'text-blue-400', label: 'Dates' },
  Boolean: { icon: ToggleLeft, color: 'text-purple-400', label: 'Booleans' },
};

export function FieldPalette() {
  const grouped = useAtomValue(ruleBuilderGroupedDimensionsAtom);
  const loading = useAtomValue(ruleBuilderLoadingAtom);
  const datasetId = useAtomValue(ruleBuilderDatasetIdAtom);

  // No dataset selected
  if (!datasetId) {
    return (
      <aside className="h-full border-r flex flex-col" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
        <div className="p-4 border-b" style={{ borderColor: '#27272a' }}>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
            Fields
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-zinc-500 text-center">
            Select a dataset to view available fields
          </p>
        </div>
      </aside>
    );
  }

  // Loading state
  if (loading.dimensions) {
    return (
      <aside className="h-full border-r flex flex-col" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
        <div className="p-4 border-b" style={{ borderColor: '#27272a' }}>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
            Fields
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-5 w-5 text-zinc-500 animate-spin" />
        </div>
      </aside>
    );
  }

  const groups = (Object.entries(grouped) as [DimensionDataType, typeof grouped.Number][]).filter(
    ([, dims]) => dims.length > 0
  );

  return (
    <aside className="h-full border-r flex flex-col overflow-hidden" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
      <div className="p-4 border-b flex-shrink-0" style={{ borderColor: '#27272a' }}>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
          Fields
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {groups.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center p-4">
            No mapped dimensions found for this dataset
          </p>
        ) : (
          groups.map(([type, dimensions]) => {
            const config = TYPE_CONFIG[type];
            const Icon = config.icon;

            return (
              <div key={type}>
                <div className="flex items-center gap-2 px-2 py-1 mb-2">
                  <Icon className={`h-3 w-3 ${config.color}`} />
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                    {config.label}
                  </span>
                  <span className="text-[10px] text-zinc-600">({dimensions.length})</span>
                </div>
                <div className="space-y-0.5">
                  {dimensions.map((dim) => (
                    <FieldItem key={dim.id} dimension={dim} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
