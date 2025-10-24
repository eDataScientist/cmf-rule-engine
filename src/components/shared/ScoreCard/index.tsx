import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TraceResult } from '@/lib/types/trace';
import { RiskBadge } from './RiskBadge';
import { ProbabilityIndicator } from './ProbabilityIndicator';
import { ScoreBreakdown } from './ScoreBreakdown';

interface ScoreCardProps {
  result: TraceResult;
  showBreakdown?: boolean;
}

export function ScoreCard({ result, showBreakdown = true }: ScoreCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Risk Assessment</CardTitle>
          <RiskBadge riskLevel={result.riskLevel} size="lg" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProbabilityIndicator
          probability={result.probability}
          riskLevel={result.riskLevel}
        />

        {showBreakdown && (
          <ScoreBreakdown paths={result.paths} totalScore={result.totalScore} />
        )}

        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            Claim: <span className="font-mono">{result.claimNumber}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
