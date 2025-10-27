import { useState, useMemo, useEffect } from 'react';
import { useAtom } from 'jotai';
import { PageHeader } from '@/components/shared/Layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Loader2, Play, Download, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TreeGrid } from './components/TreeGrid';
import { EmptyState } from './components/EmptyState';
import { useTreeList } from './hooks/useTreeList';
import { useTreeDelete } from './hooks/useTreeDelete';
import { ClaimForm } from '../visualize-trace/components/ClaimForm';
import { JsonInput } from '../visualize-trace/components/JsonInput';
import { InputModeToggle, type InputMode } from '../visualize-trace/components/InputModeToggle';
import { ScoreCard } from '@/components/shared/ScoreCard';
import { TracedTreeVisualizer } from '../visualize-trace/components/TracedTreeVisualizer';
import { useClaimEvaluation } from '../visualize-trace/hooks/useClaimEvaluation';
import { useImageExport } from '../visualize-trace/hooks/useImageExport';
import { extractFeatures } from '../visualize-trace/utils/extractFeatures';
import { selectedTableTreeIdAtom, selectedTableClaimDataAtom, selectedTableTabAtom, isFromTableVisualizerAtom } from '@/store/atoms/tableVisualization';
import type { ClaimData } from '@/lib/types/claim';

export default function ReviewTrees() {
  const navigate = useNavigate();
  const location = useLocation();
  const { trees, isLoading, error } = useTreeList();
  const { remove, isDeleting } = useTreeDelete();

  // Table visualization atoms
  const [tableTreeId, setTableTreeId] = useAtom(selectedTableTreeIdAtom);
  const [tableClaimData, setTableClaimData] = useAtom(selectedTableClaimDataAtom);
  const [tableTab] = useAtom(selectedTableTabAtom);
  const [isFromTable, setIsFromTable] = useAtom(isFromTableVisualizerAtom);

  const [activeTab, setActiveTab] = useState('trees');
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('form');
  const [claim, setClaim] = useState<ClaimData>({});
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [cameFromTable, setCameFromTable] = useState(false);

  const { result, isEvaluating, error: evalError, evaluate } = useClaimEvaluation();
  const { exportAsImage, isExporting } = useImageExport();

  const selectedTree = trees.find((t) => t.id === selectedTreeId);

  const features = useMemo(() => {
    if (!selectedTree) return new Map();
    return extractFeatures(selectedTree.structure);
  }, [selectedTree]);

  // Handle tree pre-selection from navigation state
  useEffect(() => {
    const state = location.state as { selectedTreeId?: string } | null;
    if (state?.selectedTreeId && trees.length > 0) {
      const treeExists = trees.some((t) => t.id === state.selectedTreeId);
      if (treeExists) {
        setSelectedTreeId(state.selectedTreeId);
        setClaim({});
        setJsonInput('');
        setActiveTab('form');
        // Clear the state to prevent re-triggering
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, trees, navigate, location.pathname]);

  // Handle table visualization state
  useEffect(() => {
    if (isFromTable && tableTreeId && tableClaimData && trees.length > 0) {
      const treeExists = trees.some((t) => t.id === tableTreeId);
      if (treeExists) {
        setSelectedTreeId(tableTreeId);
        setClaim(tableClaimData);
        setInputMode('form');
        setJsonInput('');
        setActiveTab(tableTab);
        setCameFromTable(true);

        // Clear atoms to prevent re-triggering
        setTableTreeId(null);
        setTableClaimData(null);
        setIsFromTable(false);
      }
    }
  }, [isFromTable, tableTreeId, tableClaimData, tableTab, trees, setTableTreeId, setTableClaimData, setIsFromTable]);

  // Auto-evaluate claim when coming from table
  useEffect(() => {
    if (selectedTree && claim['Claim number'] && activeTab === 'visualization' && !result && isFromTable === false && tableTreeId === null) {
      evaluate(claim, selectedTree.structure);
    }
  }, [selectedTree, claim, activeTab, result, evaluate, isFromTable, tableTreeId]);

  const handleVisualize = (treeId: string) => {
    setSelectedTreeId(treeId);
    setClaim({});
    setJsonInput('');
    setActiveTab('form');
    setCameFromTable(false);
  };

  const handleViewStructure = (treeId: string) => {
    navigate(`/tree-visualizer/${treeId}`);
  };

  const handleEvaluate = () => {
    if (!selectedTree) return;

    const claimToEvaluate = inputMode === 'json'
      ? (jsonInput ? JSON.parse(jsonInput) : {})
      : claim;

    evaluate(claimToEvaluate, selectedTree.structure);
    setActiveTab('visualization');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error loading trees: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Decision Trees"
        description="Manage trees and visualize claim evaluations"
        actions={
          trees.length > 0 && (
            <Button onClick={() => navigate('/generate-tree')}>
              <Plus className="h-4 w-4 mr-2" />
              New Tree
            </Button>
          )
        }
      />

      {trees.length === 0 ? (
        <EmptyState />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="trees">All Trees</TabsTrigger>
            <TabsTrigger value="form" disabled={!selectedTree}>Claim Form</TabsTrigger>
            <TabsTrigger value="visualization" disabled={!result}>Visualization</TabsTrigger>
          </TabsList>

          <TabsContent value="trees">
            <TreeGrid
              trees={trees}
              onDelete={remove}
              onVisualize={handleVisualize}
              onViewStructure={handleViewStructure}
              isDeleting={isDeleting}
            />
          </TabsContent>

          <TabsContent value="form">
            {selectedTree && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Selected Tree</h3>
                        <p className="text-sm text-muted-foreground">{selectedTree.name}</p>
                      </div>
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
                    </div>
                  </CardContent>
                </Card>

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
              </div>
            )}
          </TabsContent>

          <TabsContent value="visualization">
            {result && selectedTree && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Evaluation Results</h2>
                  <div className="flex gap-2">
                    {cameFromTable && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate('/table-visualizer');
                          setCameFromTable(false);
                        }}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Table
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleExport}
                      disabled={isExporting}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as PNG
                    </Button>
                  </div>
                </div>

                <div id="trace-result" className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
                  {/* Left: Score Card */}
                  <div>
                    <ScoreCard result={result} showBreakdown />
                  </div>

                  {/* Right: Tree Visualizer */}
                  <Card>
                    <CardContent className="pt-6">
                      <TracedTreeVisualizer
                        trees={selectedTree.structure}
                        paths={result.paths}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
