export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function calculateProbability(totalScore: number): number {
  return sigmoid(totalScore);
}
