import type { ClaimData } from '@/lib/types/claim';
import type { FeatureInfo } from '../utils/extractFeatures';

interface ClaimFormProps {
  claim: ClaimData;
  onChange: (claim: ClaimData) => void;
  features: Map<string, FeatureInfo>;
}

export function ClaimForm({ claim, onChange, features }: ClaimFormProps) {
  const updateField = (field: keyof ClaimData, value: string | number | boolean) => {
    onChange({ ...claim, [field]: value });
  };

  const handleNumberChange = (field: keyof ClaimData, value: string) => {
    const num = value === '' ? 0 : parseFloat(value);
    updateField(field, num);
  };

  const handleCheckboxChange = (field: keyof ClaimData, checked: boolean) => {
    updateField(field, checked ? 1 : 0);
  };

  // Convert feature name to readable label
  const toLabel = (name: string): string => {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Sort and group features by type
  const sortedFeatures = Array.from(features.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const booleanFeatures = sortedFeatures.filter((f) => f.type === 'boolean');
  const numericFeatures = sortedFeatures.filter((f) => f.type === 'number');

  return (
    <div className="p-4 space-y-6">
      {/* Claim Identity Section */}
      <section className="space-y-2">
        <h3
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: '#71717a' }}
        >
          Claim Identity
        </h3>
        <input
          type="text"
          className="w-full h-8 px-3 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-zinc-600"
          style={{
            backgroundColor: '#000000',
            border: '1px solid #3f3f46',
            color: '#fafafa',
          }}
          placeholder="CLM-2024-001"
          value={claim['Claim number'] || ''}
          onChange={(e) => updateField('Claim number', e.target.value)}
        />
      </section>

      {/* Boolean Features - 2-column horizontal grid */}
      {booleanFeatures.length > 0 && (
        <section className="space-y-3">
          <h3
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: '#71717a' }}
          >
            Boolean Features ({booleanFeatures.length})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {booleanFeatures.map((feature) => (
              <label
                key={feature.name}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-zinc-800/50 transition-colors"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-700 bg-black accent-blue-500"
                  checked={!!claim[feature.name]}
                  onChange={(e) => handleCheckboxChange(feature.name, e.target.checked)}
                />
                <span className="text-sm truncate" style={{ color: '#a1a1aa' }}>
                  {toLabel(feature.name)}
                </span>
              </label>
            ))}
          </div>
        </section>
      )}

      {/* Numeric Features - 2-column grid */}
      {numericFeatures.length > 0 && (
        <section className="space-y-3">
          <h3
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: '#71717a' }}
          >
            Numeric Features ({numericFeatures.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {numericFeatures.map((feature) => (
              <div key={feature.name} className="space-y-1">
                <label
                  className="text-xs truncate block"
                  style={{ color: '#71717a' }}
                  htmlFor={`field-${feature.name}`}
                  title={toLabel(feature.name)}
                >
                  {toLabel(feature.name)}
                </label>
                <input
                  id={`field-${feature.name}`}
                  type="number"
                  step="0.01"
                  className="w-full h-8 px-3 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  style={{
                    backgroundColor: '#000000',
                    border: '1px solid #3f3f46',
                    color: '#fafafa',
                  }}
                  value={claim[feature.name] !== undefined ? String(claim[feature.name]) : ''}
                  onChange={(e) => handleNumberChange(feature.name, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {sortedFeatures.length === 0 && (
        <p className="text-sm" style={{ color: '#71717a' }}>
          Select a tree to see available features.
        </p>
      )}
    </div>
  );
}
