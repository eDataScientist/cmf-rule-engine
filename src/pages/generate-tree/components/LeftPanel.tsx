import { Database, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { TypeSelector } from './TypeSelector';
import type { TreeType } from '@/lib/types/tree';
import type { DatasetWithStatus } from '@/lib/db/operations';

interface DatasetContext {
  id: number;
  name: string;
  company: string;
  country: string;
}

interface LeftPanelProps {
  datasets: DatasetWithStatus[];
  selectedDatasetId: number | null;
  onDatasetChange: (id: number | null) => void;
  datasetContext?: DatasetContext;
  treeType: TreeType;
  onTreeTypeChange: (type: TreeType) => void;
  booleanCandidates: any[];
  booleanDecisions: Record<string, boolean>;
  onBooleanDecisionChange: (decisions: Record<string, boolean>) => void;
}

export function LeftPanel({
  datasets,
  selectedDatasetId,
  onDatasetChange,
  datasetContext,
  treeType,
  onTreeTypeChange,
  booleanCandidates,
  booleanDecisions,
  onBooleanDecisionChange,
}: LeftPanelProps) {
  return (
    <aside
      className="w-[360px] flex-shrink-0 border-r flex flex-col overflow-hidden"
      style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b" style={{ borderColor: '#27272a' }}>
        <h2 className="text-sm font-medium" style={{ color: '#fafafa' }}>
          Tree Configuration
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Dataset Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: '#fafafa' }}>
              Dataset Association <span className="text-zinc-500">(Optional)</span>
            </label>
            <p className="text-xs" style={{ color: '#71717a' }}>
              Select a dataset to associate with this tree
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  value={selectedDatasetId?.toString() ?? ''}
                  onChange={(e) => onDatasetChange(e.target.value ? Number(e.target.value) : null)}
                  options={[
                    { value: '', label: '(No dataset - standalone tree)' },
                    ...datasets.map(d => ({
                      value: d.id.toString(),
                      label: `${d.fileName || `Dataset ${d.id}`} - ${d.insuranceCompany}`
                    }))
                  ]}
                />
              </div>
              {selectedDatasetId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDatasetChange(null)}
                  title="Clear selection"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Selected Dataset Info */}
          {datasetContext && (
            <div
              className="flex items-start gap-3 p-3 rounded-md border"
              style={{ borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
            >
              <Database className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#3b82f6' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#fafafa' }}>
                  {datasetContext.name}
                </p>
                <p className="text-xs" style={{ color: '#a1a1aa' }}>
                  {datasetContext.company} • {datasetContext.country}
                </p>
              </div>
            </div>
          )}

          {/* Tree Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: '#fafafa' }}>
              Tree Type
            </label>
            <TypeSelector value={treeType} onChange={onTreeTypeChange} />
          </div>

          {/* Boolean Thresholds */}
          {booleanCandidates.length > 0 && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium" style={{ color: '#fafafa' }}>
                  Boolean Thresholds
                </label>
                <p className="text-xs mt-1" style={{ color: '#71717a' }}>
                  Convert 0.5 thresholds to Yes/No checks
                </p>
              </div>
              <div className="space-y-2">
                {booleanCandidates.map((candidate) => {
                  const decision = booleanDecisions[candidate.key] ?? true;
                  const conversionSuffix = candidate.operator === '<=' ? 'is No' : 'is Yes';

                  return (
                    <div
                      key={candidate.key}
                      className="rounded-md border p-3 space-y-2"
                      style={{ borderColor: '#27272a', backgroundColor: '#09090b' }}
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-medium" style={{ color: '#fafafa' }}>
                          Tree {candidate.treeIndex + 1}: {candidate.feature}
                        </p>
                        <p className="text-xs" style={{ color: '#71717a' }}>
                          {candidate.feature} {conversionSuffix}
                        </p>
                      </div>
                      <select
                        value={decision ? 'boolean' : 'numeric'}
                        onChange={(e) =>
                          onBooleanDecisionChange({
                            ...booleanDecisions,
                            [candidate.key]: e.target.value === 'boolean',
                          })
                        }
                        className="w-full rounded-md border bg-background p-2 text-sm"
                        style={{
                          borderColor: '#27272a',
                          backgroundColor: '#18181b',
                          color: '#fafafa',
                        }}
                      >
                        <option value="boolean">Use Yes/No</option>
                        <option value="numeric">Keep numeric ({candidate.operator} 0.5)</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
