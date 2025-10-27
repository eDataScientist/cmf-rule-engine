import { CheckCircle2, AlertCircle, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { ValidationResult } from '@/lib/processing/TabularClaimsProcessor';

interface ColumnValidationProps {
  validation: ValidationResult;
  onProceed: () => void;
  onClaimNumberChange: (columnName: string) => void;
  isProcessing?: boolean;
}

export function ColumnValidation({ validation, onProceed, onClaimNumberChange, isProcessing }: ColumnValidationProps) {
  const extraColumns = validation.availableColumns.filter(
    (col) => !validation.requiredColumns.includes(col)
  );

  const hasClaimNumber = validation.claimNumberColumn !== null;
  const allRequiredPresent = validation.missingColumns.length === 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Column Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Claim Number Selector */}
          <div className="p-4 bg-muted/50 border rounded-md">
            <Label htmlFor="claim-number-select" className="font-medium mb-2 block">
              Select Claim Number Column *
            </Label>
            <select
              id="claim-number-select"
              className="w-full p-2 border rounded-md bg-background"
              value={validation.claimNumberColumn || ''}
              onChange={(e) => onClaimNumberChange(e.target.value)}
            >
              <option value="">-- Select a column --</option>
              {validation.availableColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              Choose which column contains the claim identifier/number
            </p>
          </div>

          {/* Validation Status */}
          <div className="flex items-center gap-2">
            {validation.isValid ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-green-600 font-medium">
                  All required columns present and claim number selected
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="text-destructive font-medium">
                  {!hasClaimNumber && 'Claim number column not selected'}
                  {hasClaimNumber && !allRequiredPresent && 'Missing required columns'}
                </span>
              </>
            )}
          </div>

          {/* Required Columns */}
          <div>
            <h3 className="font-medium mb-2">Required Columns ({validation.requiredColumns.length})</h3>
            <div className="flex flex-wrap gap-2">
              {validation.requiredColumns.map((col) => {
                const isPresent = validation.availableColumns.includes(col);
                return (
                  <Badge
                    key={col}
                    variant={isPresent ? 'secondary' : 'destructive'}
                    className="font-mono"
                  >
                    {isPresent ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                    {col}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Missing Columns Warning */}
          {validation.missingColumns.length > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="font-medium text-destructive mb-2">
                Missing Columns ({validation.missingColumns.length}):
              </p>
              <ul className="list-disc list-inside text-sm text-destructive/80 space-y-1">
                {validation.missingColumns.map((col) => (
                  <li key={col} className="font-mono">{col}</li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                Please ensure your CSV file contains all required columns with exact matching names (including underscores and capitalization).
              </p>
            </div>
          )}

          {/* Extra Columns Info */}
          {extraColumns.length > 0 && validation.isValid && (
            <div className="p-4 bg-muted/50 border rounded-md">
              <p className="font-medium mb-2">
                Extra Columns ({extraColumns.length}) - Will be ignored:
              </p>
              <div className="flex flex-wrap gap-2">
                {extraColumns.map((col) => (
                  <Badge key={col} variant="outline" className="font-mono text-xs">
                    {col}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Proceed Button */}
          {validation.isValid && (
            <div className="pt-4 border-t">
              <Button
                onClick={onProceed}
                disabled={isProcessing}
                size="lg"
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Process Claims'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
