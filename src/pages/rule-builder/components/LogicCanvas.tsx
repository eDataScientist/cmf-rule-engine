import { useAtomValue } from 'jotai';
import { ruleBuilderDatasetIdAtom, ruleBuilderRulesAtom } from '@/store/atoms/ruleBuilder';
import { DatasetSelector } from './DatasetSelector';
import { LogicStack } from './LogicStack';
import { MagicInput } from './MagicInput';

export function LogicCanvas() {
  const datasetId = useAtomValue(ruleBuilderDatasetIdAtom);
  const rules = useAtomValue(ruleBuilderRulesAtom);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#09090b' }}>
      {/* Header with dataset selector */}
      <div className="flex-shrink-0 p-4 border-b" style={{ borderColor: '#27272a' }}>
        <DatasetSelector />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!datasetId ? (
          // No dataset selected overlay
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-zinc-400 text-sm mb-2">Select a dataset to begin</p>
              <p className="text-zinc-600 text-xs">
                Choose a dataset from the dropdown above to start building rules
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Logic Stack */}
            <div className="flex-1 overflow-y-auto p-4">
              {rules.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-zinc-500 text-sm mb-2">No rules yet</p>
                    <p className="text-zinc-600 text-xs">
                      Type or drag a field to create your first rule
                    </p>
                  </div>
                </div>
              ) : (
                <LogicStack />
              )}
            </div>

            {/* Magic Input */}
            <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: '#27272a' }}>
              <MagicInput />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
