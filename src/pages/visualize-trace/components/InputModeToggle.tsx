import { Button } from '@/components/ui/button';
import { FormInput, Code } from 'lucide-react';

export type InputMode = 'form' | 'json';

interface InputModeToggleProps {
  mode: InputMode;
  onChange: (mode: InputMode) => void;
}

export function InputModeToggle({ mode, onChange }: InputModeToggleProps) {
  return (
    <div className="flex w-fit items-center gap-2 rounded-full border border-white/60 bg-white/70 p-1.5 shadow-inner shadow-black/5">
      <Button
        variant={mode === 'form' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('form')}
        className="gap-2 rounded-full px-5 text-[0.7rem] font-semibold uppercase tracking-[0.3em]"
      >
        <FormInput className="h-4 w-4" />
        Form
      </Button>
      <Button
        variant={mode === 'json' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('json')}
        className="gap-2 rounded-full px-5 text-[0.7rem] font-semibold uppercase tracking-[0.3em]"
      >
        <Code className="h-4 w-4" />
        JSON
      </Button>
    </div>
  );
}
