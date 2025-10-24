import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/Layout/PageHeader';
import { ScoreCard } from '@/components/shared/ScoreCard';
import { TreeSelector } from './components/TreeSelector';
import { InputModeToggle, type InputMode } from './components/InputModeToggle';
import { ClaimForm } from './components/ClaimForm';
import { JsonInput } from './components/JsonInput';
import { TracedTreeVisualizer } from './components/TracedTreeVisualizer';
import { useClaimEvaluation } from './hooks/useClaimEvaluation';
import { useImageExport } from './hooks/useImageExport';
import { extractFeatures } from './utils/extractFeatures';
import { treesAtom } from '@/store/atoms/trees';
import { getTrees } from '@/lib/db/operations';
import type { ClaimData } from '@/lib/types/claim';
import { Play, Download, Loader2 } from 'lucide-react';

export default function VisualizeTrace() {
  const navigate = useNavigate();
  const storedTrees = useAtomValue(treesAtom);

  const [trees, setTrees] = useState(storedTrees);
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('form');
  const [claim, setClaim] = useState<ClaimData>({});
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const { result, isEvaluating, error: evalError, evaluate } = useClaimEvaluation();
  const { exportAsImage, isExporting } = useImageExport();

  useEffect(() => {
    async function loadTrees() {
      const loadedTrees = await getTrees();
      setTrees(loadedTrees);
    }
    loadTrees();
  }, []);

  const selectedTree = trees.find((t) => t.id === selectedTreeId);

  // Extract features from selected tree
  const features = useMemo(() => {
    if (!selectedTree) return new Map();
    return extractFeatures(selectedTree.structure);
  }, [selectedTree]);

  const handleEvaluate = () => {
    if (!selectedTree) return;

    const claimToEvaluate = inputMode === 'json'
      ? (jsonInput ? JSON.parse(jsonInput) : {})
      : claim;

    evaluate(claimToEvaluate, selectedTree.structure);
  };

  const handleExport = () => {
    if (!result) return;
    exportAsImage('trace-result', `trace-${result.claimNumber}`);
  };

  const canEvaluate = selectedTree && (
    inputMode === 'form'
      ? !!claim['Claim number']
      : jsonInput && !jsonError
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visualize Trace"
        description="Evaluate claims and visualize decision paths through the tree"
      />

      {trees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No trees available. Please create a tree first.
            </p>
            <Button onClick={() => navigate('/generate-tree')}>
              Create Tree
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <TreeSelector
            trees={trees}
            selectedTreeId={selectedTreeId}
            onSelect={setSelectedTreeId}
          />

          {selectedTree && (
            <>
              <div className="flex items-center justify-between">
                <InputModeToggle mode={inputMode} onChange={setInputMode} />
                <Button
                  onClick={handleEvaluate}
                  disabled={!canEvaluate || isEvaluating}
                  size="lg"
                >
                  {isEvaluating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Evaluate Claim
                </Button>
              </div>

              {inputMode === 'form' ? (
                <ClaimForm claim={claim} onChange={setClaim} features={features} />
              ) : (
                <JsonInput
                  value={jsonInput}
                  onChange={setJsonInput}
                  onParsed={(parsed) => {
                    if (parsed) {
                      setJsonError(null);
                      setClaim(parsed);
                    } else if (jsonInput) {
                      setJsonError('Invalid JSON format');
                    }
                  }}
                  isValid={!jsonError && !!jsonInput}
                  error={jsonError}
                />
              )}

              {evalError && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="py-4">
                    <p className="text-sm text-red-600">{evalError}</p>
                  </CardContent>
                </Card>
              )}

              {result && (
                <div id="trace-result" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Evaluation Results</h2>
                    <Button
                      variant="outline"
                      onClick={handleExport}
                      disabled={isExporting}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as PNG
                    </Button>
                  </div>

                  <ScoreCard result={result} showBreakdown />

                  <Card>
                    <CardContent className="pt-6">
                      <TracedTreeVisualizer
                        trees={selectedTree.structure}
                        paths={result.paths}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
