import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ClaimData } from '@/lib/types/claim';

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  onParsed: (claim: ClaimData | null) => void;
  isValid: boolean;
  error: string | null;
}

export function JsonInput({ value, onChange, onParsed, isValid, error }: JsonInputProps) {
  const handleChange = (newValue: string) => {
    onChange(newValue);

    if (!newValue.trim()) {
      onParsed(null);
      return;
    }

    try {
      const parsed = JSON.parse(newValue);
      onParsed(parsed as ClaimData);
    } catch {
      onParsed(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>JSON Input</CardTitle>
          {value && (
            <div className="flex items-center gap-2">
              {isValid ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Valid</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">Invalid</span>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="json-input">Paste claim data as JSON</Label>
        <Textarea
          id="json-input"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`{\n  "Claim number": "CLM-2024-001",\n  "count_of_parts": 3,\n  "damage_left": 1,\n  "Estimated_Amount": 5000\n}`}
          className="font-mono text-sm min-h-[300px]"
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
