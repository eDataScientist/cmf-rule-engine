import { Loader2, CheckCircle2 } from 'lucide-react';
import type { TreeAssociation } from '@/lib/db/operations';
import type { QualityMetrics } from '../hooks/useQualityMetrics';
import QualityMetricsGrid from './QualityMetricsGrid';
import CriticalColumnsAlert from './CriticalColumnsAlert';
import LinkedTreesList from './LinkedTreesList';

interface OverviewTabProps {
  quality: QualityMetrics | null;
  loadingQuality: boolean;
  associations: TreeAssociation[];
  loadingAssociations: boolean;
  datasetId: number;
  datasetName: string;
  onLinkSuccess: () => void;
}

export default function OverviewTab({
  quality,
  loadingQuality,
  associations,
  loadingAssociations,
  datasetId,
  datasetName,
  onLinkSuccess,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Quality Metrics HUD */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Data Quality Metrics</h2>
        <QualityMetricsGrid quality={quality} loading={loadingQuality} />
      </div>

      {/* Critical Columns Alert */}
      {quality && quality.missing_critical_columns.length > 0 ? (
        <CriticalColumnsAlert columns={quality.missing_critical_columns} />
      ) : quality && quality.missing_critical_columns.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 p-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>All critical columns are present</span>
        </div>
      ) : null}

      {/* Linked Trees */}
      <div>
        <LinkedTreesList
          associations={associations}
          loading={loadingAssociations}
          datasetId={datasetId}
          datasetName={datasetName}
          onLinkSuccess={onLinkSuccess}
        />
      </div>
    </div>
  );
}
