import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  // Sort features alphabetically
  const sortedFeatures = Array.from(features.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Claim Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Always show claim number */}
        <div className="space-y-4">
          <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Basic Information
          </h3>
          <div className="space-y-2">
            <Label htmlFor="claim-number" className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Claim Number *
            </Label>
            <Input
              id="claim-number"
              value={claim['Claim number'] || ''}
              onChange={(e) => updateField('Claim number', e.target.value)}
              placeholder="CLM-2024-001"
            />
          </div>
        </div>

        {/* Dynamic fields based on tree features */}
        {sortedFeatures.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Tree Features ({sortedFeatures.length})
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {sortedFeatures.map((feature) => {
                const fieldId = `field-${feature.name}`;

                if (feature.type === 'boolean') {
                  return (
                    <div key={feature.name} className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-inner shadow-black/5">
                      <input
                        id={fieldId}
                        type="checkbox"
                        checked={!!claim[feature.name]}
                        onChange={(e) => handleCheckboxChange(feature.name, e.target.checked)}
                        className="h-5 w-5 rounded-md border border-white/60 bg-white/90 text-primary focus:ring-primary/40"
                      />
                      <Label htmlFor={fieldId} className="text-sm font-medium text-foreground">
                        {toLabel(feature.name)}
                      </Label>
                    </div>
                  );
                }

                return (
                  <div key={feature.name} className="space-y-2">
                    <Label htmlFor={fieldId} className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      {toLabel(feature.name)}
                    </Label>
                    <Input
                      id={fieldId}
                      type="number"
                      step="0.01"
                      value={claim[feature.name] !== undefined ? String(claim[feature.name]) : ''}
                      onChange={(e) => handleNumberChange(feature.name, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {sortedFeatures.length === 0 && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            No features found in the tree. Please select a valid tree.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
