import type { TreePath } from '@/lib/types/trace';

interface ScoreBreakdownProps {
  paths: TreePath[];
  totalScore: number;
}

export function ScoreBreakdown({ paths, totalScore }: ScoreBreakdownProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Score Breakdown</span>
        <span className="text-sm font-mono font-semibold">
          Total: {totalScore.toFixed(4)}
        </span>
      </div>

      <div className="space-y-2">
        {paths.map((path) => {
          const isPositive = path.leafValue >= 0;
          const valueColor = isPositive ? 'text-red-600' : 'text-green-600';

          return (
            <div
              key={path.treeIndex}
              className="flex items-center justify-between p-2 bg-muted/50 rounded"
            >
              <span className="text-sm font-medium">Tree #{path.treeIndex}</span>
              <span className={`text-sm font-mono font-semibold ${valueColor}`}>
                {isPositive ? '+' : ''}
                {path.leafValue.toFixed(4)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
