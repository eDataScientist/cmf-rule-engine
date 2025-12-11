export function calculateProbability(totalScore: number, _minScore: number, _maxScore: number): number {
  if (Number.isNaN(totalScore)) {
    return 0;
  }

  // Return score directly as probability (0.253 = 25.3%)
  return Math.min(1, Math.max(0, totalScore));
}
