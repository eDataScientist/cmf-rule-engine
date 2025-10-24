interface ProbabilityIndicatorProps {
  probability: number;
  riskLevel: 'low' | 'moderate' | 'high';
}

const riskColors = {
  low: 'bg-green-500',
  moderate: 'bg-yellow-500',
  high: 'bg-red-500',
};

export function ProbabilityIndicator({ probability, riskLevel }: ProbabilityIndicatorProps) {
  const percentage = (probability * 100).toFixed(1);
  const colorClass = riskColors[riskLevel];

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-muted-foreground">Fraud Probability</span>
        <span className="text-3xl font-bold">{percentage}%</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-500`}
          style={{ width: `${probability * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
