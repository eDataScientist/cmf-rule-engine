import { Edit, Save, X, Loader2, AlertCircle, Car, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DatasetWithStatus, Dimension } from '@/lib/db/operations';
import AlignmentTable from './AlignmentTable';
import { Badge } from '@/components/ui/badge';

interface SchemaMapTabProps {
  dataset: DatasetWithStatus;
  dimensions: Dimension[];
  loadingDimensions: boolean;
  editMode: boolean;
  editableAlignment: Record<string, string>;
  validationError: string | null;
  hasChanges: boolean;
  saving: boolean;
  onEditStart: () => void;
  onEditCancel: () => void;
  onSave: () => void;
  onDimensionChange: (originalCol: string, newDim: string) => void;
}

export default function SchemaMapTab({
  dataset,
  dimensions,
  loadingDimensions,
  editMode,
  editableAlignment,
  validationError,
  hasChanges,
  saving,
  onEditStart,
  onEditCancel,
  onSave,
  onDimensionChange,
}: SchemaMapTabProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Schema Mapping</h2>
            <Badge
              variant="outline"
              className={`flex items-center gap-1.5 ${
                dataset.claimCategory === 'medical'
                  ? 'border-pink-500/50 bg-pink-500/10 text-pink-400'
                  : 'border-blue-500/50 bg-blue-500/10 text-blue-400'
              }`}
            >
              {dataset.claimCategory === 'medical' ? (
                <Stethoscope className="h-3.5 w-3.5" />
              ) : (
                <Car className="h-3.5 w-3.5" />
              )}
              {dataset.claimCategory === 'medical' ? 'Medical' : 'Motor'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Map original CSV columns to {dataset.claimCategory} dimensions
          </p>
        </div>
        {!editMode ? (
          <Button onClick={onEditStart} variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Mapping
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={onSave}
              disabled={saving || !hasChanges}
              size="sm"
              title={!hasChanges ? 'No changes to save' : ''}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            <Button onClick={onEditCancel} variant="outline" size="sm">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Validation error alert */}
      {validationError && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Alignment table */}
      {loadingDimensions ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <AlignmentTable
          alignmentMapping={dataset.alignmentMapping}
          dimensions={dimensions}
          editMode={editMode}
          editableAlignment={editableAlignment}
          onDimensionChange={onDimensionChange}
        />
      )}
    </div>
  );
}
