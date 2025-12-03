import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Select } from '@/components/ui/select';
import type { Dimension } from '@/lib/db/operations';

interface AlignmentTableRowProps {
  originalColumn: string;
  matchedDimension: string;
  dimensions: Dimension[];
  editMode: boolean;
  currentValue: string;
  onDimensionChange: (originalCol: string, newDim: string) => void;
}

export default function AlignmentTableRow({
  originalColumn,
  matchedDimension,
  dimensions,
  editMode,
  currentValue,
  onDimensionChange,
}: AlignmentTableRowProps) {
  const dimension = dimensions.find(d => d.name === matchedDimension);
  const isMapped = matchedDimension && matchedDimension.trim();

  return (
    <tr className="border-b hover:bg-muted/20">
      <td className="px-4 py-3 font-medium">{originalColumn}</td>
      <td className="px-4 py-3">
        {editMode ? (
          <Select
            value={currentValue || ''}
            onChange={(e) => onDimensionChange(originalColumn, e.target.value)}
            options={[
              { value: '', label: '(Unmapped)' },
              ...dimensions.map(d => ({
                value: d.name,
                label: `${d.displayName}${d.isCritical ? ' *' : ''}`
              }))
            ]}
          />
        ) : (
          <div className="flex items-center gap-2">
            {isMapped ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{dimension?.displayName || matchedDimension}</span>
                {dimension?.isCritical && (
                  <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                    Critical
                  </span>
                )}
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-muted-foreground">(Unmapped)</span>
              </>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
