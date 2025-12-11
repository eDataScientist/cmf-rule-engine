import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { Database, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/db/supabase';
import { ruleBuilderDatasetIdAtom, resetRuleBuilderAtom } from '@/store/atoms/ruleBuilder';
import { useSetAtom } from 'jotai';

interface Dataset {
  id: number;
  nickname: string | null;
  fileName: string | null;
  insuranceCompany: string;
  rows: number;
}

export function DatasetSelector() {
  const [datasetId, setDatasetId] = useAtom(ruleBuilderDatasetIdAtom);
  const resetRuleBuilder = useSetAtom(resetRuleBuilderAtom);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDatasets() {
      try {
        const { data, error } = await supabase
          .from('datasets')
          .select('id, nickname, file_name, insurance_company, rows')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setDatasets(
          (data || []).map((d) => ({
            id: d.id,
            nickname: d.nickname,
            fileName: d.file_name,
            insuranceCompany: d.insurance_company,
            rows: d.rows,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch datasets:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDatasets();
  }, []);

  const selectedDataset = datasets.find((d) => d.id === datasetId);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value ? Number(e.target.value) : null;

    // If changing dataset, reset the rule builder
    if (newId !== datasetId) {
      resetRuleBuilder();
    }

    setDatasetId(newId);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-zinc-400">
        <Database className="h-4 w-4" />
        <span className="text-xs font-medium">Dataset</span>
      </div>

      <div className="relative flex-1 max-w-md">
        <select
          value={datasetId ?? ''}
          onChange={handleChange}
          disabled={loading}
          className="w-full appearance-none bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 pr-8 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 cursor-pointer"
          style={{ backgroundColor: '#18181b' }}
        >
          <option value="">Select a dataset...</option>
          {datasets.map((dataset) => (
            <option key={dataset.id} value={dataset.id}>
              {dataset.nickname || dataset.fileName || `Dataset ${dataset.id}`} ({dataset.insuranceCompany} - {dataset.rows.toLocaleString()} rows)
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
      </div>

      {selectedDataset && (
        <div className="text-xs text-zinc-500">
          {selectedDataset.rows.toLocaleString()} rows
        </div>
      )}
    </div>
  );
}
