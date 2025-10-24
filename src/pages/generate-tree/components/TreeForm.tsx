import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, FileText } from 'lucide-react';
import type { TreeType } from '@/lib/types/tree';
import { TypeSelector } from './TypeSelector';
import { TreeInput } from './TreeInput';
import { PreviewPane } from './PreviewPane';
import { SaveDialog } from './SaveDialog';
import { useTreeParser } from '../hooks/useTreeParser';
import { useTreeSave } from '../hooks/useTreeSave';
import { validateTreeStructure } from '../utils/validator';
import {
  detectBooleanCandidates,
  applyBooleanDecisions,
  type BooleanCandidate,
} from '../utils/booleanFeatures';

const SAMPLE_TREE = `veh_brand_TOYOTA <= 0.500 (Tree #0 root)
\tveh_brand_HYUNDAI <= 0.500 (split)
\t\tveh_brand_KIA <= 0.500 (split)
\t\t\tVal: 0.312 (leaf)
\t\t\tVal: 0.223 (leaf)
\t\tVal: 0.152 (leaf)
\tVal: 0.101 (leaf)

\t+
approved_claim_amount <= 13376.425 (Tree #1 root)
\tdays_between_intm_loss <= 204.500 (split)
\t\tvalue_class_ordinal <= 4.500 (split)
\t\t\tVal: -0.025 (leaf)
\t\t\tVal: 0.041 (leaf)
\t\tVal: 0.169 (leaf)
\tapproved_claim_amount <= 25028.750 (split)
\t\tVal: 0.155 (leaf)
\t\tVal: 0.367 (leaf)

\t+
value_class_ordinal <= 0.000 (Tree #2 root)
\tVal: 0.126 (leaf)
\tVal: -0.007 (leaf)`;

export function TreeForm() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [treeType, setTreeType] = useState<TreeType>('motor');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const { parsed, error, isValid, parse } = useTreeParser();
  const { save, isSaving, error: saveError } = useTreeSave();

  const [booleanCandidates, setBooleanCandidates] = useState<BooleanCandidate[]>([]);
  const [booleanDecisions, setBooleanDecisions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      parse(input);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [input, parse]);

  useEffect(() => {
    if (!parsed) {
      setBooleanCandidates([]);
      setBooleanDecisions({});
      return;
    }

    const detected = detectBooleanCandidates(parsed);
    setBooleanCandidates(detected);
    setBooleanDecisions((prev) => {
      const next: Record<string, boolean> = {};
      detected.forEach((candidate) => {
        next[candidate.key] = prev[candidate.key] ?? true;
      });
      return next;
    });
  }, [parsed]);

  const processedTrees = useMemo(
    () => applyBooleanDecisions(parsed, booleanDecisions),
    [parsed, booleanDecisions]
  );

  const structureToSave = processedTrees ?? parsed;

  const handleLoadSample = () => {
    setInput(SAMPLE_TREE);
  };

  const handleSave = async (name: string) => {
    if (!structureToSave) return;

    const structureError = validateTreeStructure(structureToSave);
    if (structureError) {
      alert(structureError);
      return;
    }

    try {
      await save(name, treeType, structureToSave);
      setShowSaveDialog(false);
      navigate('/review-trees');
    } catch {
      // Error is already handled in the hook
    }
  };

  const canSave = Boolean(isValid && structureToSave && structureToSave.length > 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tree Type</CardTitle>
        </CardHeader>
        <CardContent>
          <TypeSelector value={treeType} onChange={setTreeType} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Input</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadSample}
              >
                <FileText className="h-4 w-4 mr-2" />
                Load Sample
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TreeInput
              value={input}
              onChange={setInput}
              error={error}
              isValid={isValid}
            />
          </CardContent>
        </Card>

        <PreviewPane trees={structureToSave} />
      </div>

      {booleanCandidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Boolean Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Threshold comparisons at 0.5 can be treated as Yes/No checks for clearer trees.
              Adjust each node below as needed.
            </p>
            <div className="space-y-3">
              {booleanCandidates.map((candidate) => {
                const decision = booleanDecisions[candidate.key] ?? true;
                const conversionSuffix = candidate.operator === '<=' ? 'is No' : 'is Yes';

                return (
                  <div
                    key={candidate.key}
                    className="flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        Tree {candidate.treeIndex + 1}: {candidate.originalCondition}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Boolean conversion: {candidate.feature} {conversionSuffix}
                      </p>
                    </div>
                    <select
                      value={decision ? 'boolean' : 'numeric'}
                      onChange={(e) =>
                        setBooleanDecisions((prev) => ({
                          ...prev,
                          [candidate.key]: e.target.value === 'boolean',
                        }))
                      }
                      className="w-full rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm shadow-inner shadow-white/40 transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-auto"
                    >
                      <option value="boolean">Use Yes/No</option>
                      <option value="numeric">Keep numeric ({candidate.operator} 0.5)</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => setShowSaveDialog(true)}
          disabled={!canSave}
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Tree
        </Button>
      </div>

      {showSaveDialog && (
        <SaveDialog
          onSave={handleSave}
          onCancel={() => setShowSaveDialog(false)}
          isSaving={isSaving}
          error={saveError}
        />
      )}
    </div>
  );
}
