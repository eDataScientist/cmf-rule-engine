import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { DatasetWithRuleset } from '@/lib/db/operations';

interface DatasetRuleCardProps {
  dataset: DatasetWithRuleset;
  onEdit: () => void;
}

export function DatasetRuleCard({ dataset, onEdit }: DatasetRuleCardProps) {
  const hasRuleset = dataset.ruleset !== null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{dataset.insuranceCompany}</CardTitle>
        <CardDescription>
          {dataset.country}
          {dataset.datePeriod && ` • ${dataset.datePeriod}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {hasRuleset && dataset.ruleset ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">
                {dataset.ruleset.ruleCount} {dataset.ruleset.ruleCount === 1 ? 'rule' : 'rules'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Last edited {formatDistanceToNow(new Date(dataset.ruleset.lastEditedAt), { addSuffix: true })}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>No rules defined</span>
          </div>
        )}
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          <p>{dataset.rows.toLocaleString()} rows • {dataset.columns} columns</p>
          {dataset.fileName && <p className="mt-1 truncate">{dataset.fileName}</p>}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onEdit} className="w-full">
          {hasRuleset ? 'Edit Rules' : 'Create Rules'}
        </Button>
      </CardFooter>
    </Card>
  );
}
