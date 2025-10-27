export function calculateProbability(totalScore: number, minScore: number, maxScore: number): number {
  if (Number.isNaN(totalScore)) {
    return 0;
  }

  if (maxScore === minScore) {
    return 0.5;
  }

  const scaled = (totalScore - minScore) / (maxScore - minScore);
  if (Number.isNaN(scaled)) {
    return 0;
  }

  return Math.min(1, Math.max(0, scaled));
}
