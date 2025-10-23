import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface TreeInputProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  isValid: boolean;
}

export function TreeInput({ value, onChange, error, isValid }: TreeInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="tree-input">FIGS Tree Format</Label>
        {value && (
          <div className="flex items-center gap-1.5 text-sm">
            {isValid ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Valid</span>
              </>
            ) : error ? (
              <>
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-destructive">Invalid</span>
              </>
            ) : null}
          </div>
        )}
      </div>

      <Textarea
        id="tree-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your FIGS tree structure here...&#10;&#10;Example:&#10;feature <= 1.5 (Tree #0 root)&#10;&#9;Val: 0.212 (leaf)&#10;&#9;Val: 0.335 (leaf)"
        className="font-mono text-sm min-h-[400px]"
      />

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1.5">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
