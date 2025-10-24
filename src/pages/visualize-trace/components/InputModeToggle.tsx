import { Button } from '@/components/ui/button';
import { FormInput, Code } from 'lucide-react';

export type InputMode = 'form' | 'json';

interface InputModeToggleProps {
  mode: InputMode;
  onChange: (mode: InputMode) => void;
}

export function InputModeToggle({ mode, onChange }: InputModeToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-muted p-1 rounded-lg w-fit">
      <Button
        variant={mode === 'form' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('form')}
        className="gap-2"
      >
        <FormInput className="h-4 w-4" />
        Form
      </Button>
      <Button
        variant={mode === 'json' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('json')}
        className="gap-2"
      >
        <Code className="h-4 w-4" />
        JSON
      </Button>
    </div>
  );
}
