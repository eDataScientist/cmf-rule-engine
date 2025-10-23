import { useState, useEffect } from 'react';
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

const SAMPLE_TREE = `veh_brand_TOYOTA <= 0.500 (Tree #0 root)
\tveh_brand_HYUNDAI <= 0.500 (split)
\t\tveh_brand_KIA <= 0.500 (split)
\t\t\tVal: 0.312 (leaf)
\t\t\tVal: 0.223 (leaf)
\t\tVal: 0.152 (leaf)
\tVal: 0.101 (leaf)`;

export function TreeForm() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [treeType, setTreeType] = useState<TreeType>('motor');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const { parsed, error, isValid, parse } = useTreeParser();
  const { save, isSaving, error: saveError } = useTreeSave();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      parse(input);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [input, parse]);

  const handleLoadSample = () => {
    setInput(SAMPLE_TREE);
  };

  const handleSave = async (name: string) => {
    if (!parsed) return;

    const structureError = validateTreeStructure(parsed);
    if (structureError) {
      alert(structureError);
      return;
    }

    try {
      await save(name, treeType, parsed);
      setShowSaveDialog(false);
      navigate('/review-trees');
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const canSave = isValid && parsed && parsed.length > 0;

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

      <div className="grid lg:grid-cols-2 gap-6">
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

        <PreviewPane trees={parsed} />
      </div>

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
