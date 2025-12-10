import { Search, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  claimNumberColumn: string | null;
}

export function SearchBar({ value, onChange, placeholder, claimNumberColumn }: SearchBarProps) {
  const disabled = !claimNumberColumn;

  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase tracking-wider text-zinc-500">
        Search Claims
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={disabled ? "Select claim number column first" : placeholder}
          disabled={disabled}
          className="pl-9 h-8 bg-black border-zinc-800"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-zinc-500 hover:text-zinc-300" />
          </button>
        )}
      </div>
      {claimNumberColumn && (
        <p className="text-xs text-zinc-500">
          Searching in: <span className="font-mono">{claimNumberColumn}</span>
        </p>
      )}
    </div>
  );
}
