import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { Save, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ruleBuilderRulesAtom,
  ruleBuilderDatasetIdAtom,
  hasUnsavedChangesAtom,
} from '@/store/atoms/ruleBuilder';
import { useRuleSetSave } from '../hooks/useRuleSetSave';

export function SaveRuleSetDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const rules = useAtomValue(ruleBuilderRulesAtom);
  const datasetId = useAtomValue(ruleBuilderDatasetIdAtom);
  const hasUnsavedChanges = useAtomValue(hasUnsavedChangesAtom);
  const { saveRuleSet, isSaving, error } = useRuleSetSave();

  const canSave = name.trim().length > 0 && rules.length > 0 && datasetId !== null;

  const handleSave = async () => {
    if (!canSave) return;

    const result = await saveRuleSet(name.trim());
    if (result) {
      setIsOpen(false);
      setName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canSave) {
      handleSave();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <Button
        onClick={() => setIsOpen(true)}
        disabled={!hasUnsavedChanges || !datasetId}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        Save Rule Set
        {hasUnsavedChanges && (
          <span className="w-2 h-2 rounded-full bg-blue-500" />
        )}
      </Button>

      {/* Dialog overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog */}
          <div
            className="relative w-full max-w-md mx-4 p-6 rounded-lg border shadow-xl"
            style={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <h2 className="text-lg font-semibold text-zinc-100 mb-1">Save Rule Set</h2>
            <p className="text-sm text-zinc-500 mb-6">
              Save your {rules.length} rule{rules.length !== 1 ? 's' : ''} to the database
            </p>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="ruleset-name" className="text-zinc-300">
                  Rule Set Name
                </Label>
                <Input
                  id="ruleset-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., High Value Claims Filter"
                  className="mt-1.5 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  autoFocus
                />
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!canSave || isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
