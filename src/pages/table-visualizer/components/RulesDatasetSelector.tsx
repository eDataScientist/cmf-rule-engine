import { useState, useEffect } from 'react';
import { Database, Loader2, ListChecks, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { getDatasetsWithRulesets, type DatasetWithRuleset } from '@/lib/db/operations';
import { useAlignedDatasetLoader } from '../hooks/useAlignedDatasetLoader';
import type { RuleItem } from '@/lib/types/ruleBuilder';

interface RulesDatasetSelectorProps {
  onDatasetSelect: (
    file: File,
    datasetName: string,
    datasetId: number,
    rules: RuleItem[]
  ) => Promise<void>;
  isLoading: boolean;
}

export function RulesDatasetSelector({ onDatasetSelect, isLoading }: RulesDatasetSelectorProps) {
  const [datasets, setDatasets] = useState<DatasetWithRuleset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const { loadAlignedDataset, loading: downloading, error: loadError } = useAlignedDatasetLoader();

  useEffect(() => {
    loadDatasets();
  }, []);

  async function loadDatasets() {
    try {
      const data = await getDatasetsWithRulesets();
      setDatasets(data);
    } catch (err) {
      console.error('Failed to load datasets:', err);
    } finally {
      setLoadingDatasets(false);
    }
  }

  async function handleLoadDataset() {
    if (!selectedDatasetId) return;

    const result = await loadAlignedDataset(selectedDatasetId);
    if (!result) return;

    const { file, dataset, ruleset } = result;

    if (!ruleset || !ruleset.rules || ruleset.rules.length === 0) {
      alert('No rules defined for this dataset. Please create rules in the Rule Builder first.');
      return;
    }

    await onDatasetSelect(
      file,
      dataset.fileName || `Dataset ${dataset.id}`,
      dataset.id,
      ruleset.rules as RuleItem[]
    );
  }

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId);
  const hasRules = selectedDataset?.ruleset && selectedDataset.ruleset.ruleCount > 0;
  const hasAlignedFile = selectedDataset?.alignedFilePath;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Select
          value={selectedDatasetId?.toString() ?? ''}
          onChange={(e) => setSelectedDatasetId(e.target.value ? Number(e.target.value) : null)}
          options={[
            { value: '', label: '-- Select a dataset --' },
            ...datasets.map(d => ({
              value: d.id.toString(),
              label: `${d.fileName || `Dataset ${d.id}`} - ${d.insuranceCompany}${d.ruleset ? ` (${d.ruleset.ruleCount} rules)` : ' (no rules)'}`
            }))
          ]}
          disabled={loadingDatasets || isLoading || downloading}
        />

        {selectedDataset && (
          <div className="rounded border p-2" style={{ borderColor: '#3f3f46', backgroundColor: '#27272a' }}>
            <div className="flex items-start gap-2">
              <Database className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-100">
                  {selectedDataset.fileName || `Dataset #${selectedDataset.id}`}
                </p>
                <div className="mt-1 space-y-0.5">
                  <p className="text-[10px] text-zinc-400">
                    <span className="font-medium">Company:</span> {selectedDataset.insuranceCompany}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    <span className="font-medium">Country:</span> {selectedDataset.country}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    <span className="font-medium">Size:</span> {selectedDataset.rows} rows
                  </p>
                </div>

                {/* Rules status */}
                <div className="mt-2 flex items-center gap-2">
                  <ListChecks className={`h-3.5 w-3.5 ${hasRules ? 'text-green-400' : 'text-zinc-500'}`} />
                  <span className={`text-[10px] ${hasRules ? 'text-green-400' : 'text-zinc-500'}`}>
                    {hasRules
                      ? `${selectedDataset.ruleset!.ruleCount} rules defined`
                      : 'No rules defined'}
                  </span>
                </div>

                {/* Aligned file status */}
                {!hasAlignedFile && (
                  <div className="mt-1 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[10px] text-amber-400">
                      No aligned file available
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {loadError && (
          <p className="text-xs text-red-400">{loadError}</p>
        )}

        <Button
          onClick={handleLoadDataset}
          disabled={!selectedDatasetId || !hasRules || !hasAlignedFile || isLoading || downloading}
          className="w-full h-8"
          size="sm"
        >
          {downloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading Aligned Data...
            </>
          ) : (
            'Load Dataset & Rules'
          )}
        </Button>

        {selectedDataset && !hasRules && (
          <p className="text-[10px] text-zinc-500 text-center">
            Create rules in the Rule Builder first
          </p>
        )}
      </div>

      {loadingDatasets && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">Loading datasets...</span>
        </div>
      )}
    </div>
  );
}
