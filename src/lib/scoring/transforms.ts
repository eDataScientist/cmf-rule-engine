export function calculateProbability(totalScore: number, _minScore: number, _maxScore: number): number {
  if (Number.isNaN(totalScore)) {
    return 0;
  }

  // Simple calculation: score * 100, clamped between 0 and 1
  const probability = totalScore * 100;
  return Math.min(1, Math.max(0, probability));
}
