import type { EnrichedTraceResult, FinancialMetrics, PriceDistributionBin } from '@/lib/types/trace';
import { formatCurrencyCompact } from './formatCurrency';

export function computeFinancialMetrics(enrichedResults: EnrichedTraceResult[]): FinancialMetrics {
  // Filter to only claims with valid amounts
  const validAmounts = enrichedResults.filter(
    (r) => r.estimatedAmount !== null && r.estimatedAmount > 0
  );

  // Handle empty case
  if (validAmounts.length === 0) {
    return {
      totalClaimedValue: 0,
      averageClaimValue: 0,
      claimsWithFinancialData: 0,
      valueByRisk: {
        low: { totalValue: 0, avgValue: 0, count: 0 },
        moderate: { totalValue: 0, avgValue: 0, count: 0 },
        high: { totalValue: 0, avgValue: 0, count: 0 },
      },
      priceDistribution: {
        high: [],
        low: [],
      },
    };
  }

  // Compute totals
  const totalClaimedValue = validAmounts.reduce((sum, r) => sum + r.estimatedAmount!, 0);
  const averageClaimValue = totalClaimedValue / validAmounts.length;

  // Aggregate by risk level
  const valueByRisk = aggregateByRisk(validAmounts);

  // Compute price distributions
  const highRiskClaims = validAmounts.filter((r) => r.riskLevel === 'high');
  const lowRiskClaims = validAmounts.filter((r) => r.riskLevel === 'low');

  const priceDistribution = {
    high: calculatePriceBins(highRiskClaims.map((r) => r.estimatedAmount!), 10),
    low: calculatePriceBins(lowRiskClaims.map((r) => r.estimatedAmount!), 10),
  };

  return {
    totalClaimedValue,
    averageClaimValue,
    claimsWithFinancialData: validAmounts.length,
    valueByRisk,
    priceDistribution,
  };
}

function aggregateByRisk(results: EnrichedTraceResult[]) {
  const groups = {
    low: results.filter((r) => r.riskLevel === 'low'),
    moderate: results.filter((r) => r.riskLevel === 'moderate'),
    high: results.filter((r) => r.riskLevel === 'high'),
  };

  return {
    low: {
      totalValue: groups.low.reduce((sum, r) => sum + r.estimatedAmount!, 0),
      avgValue: groups.low.length > 0
        ? groups.low.reduce((sum, r) => sum + r.estimatedAmount!, 0) / groups.low.length
        : 0,
      count: groups.low.length,
    },
    moderate: {
      totalValue: groups.moderate.reduce((sum, r) => sum + r.estimatedAmount!, 0),
      avgValue: groups.moderate.length > 0
        ? groups.moderate.reduce((sum, r) => sum + r.estimatedAmount!, 0) / groups.moderate.length
        : 0,
      count: groups.moderate.length,
    },
    high: {
      totalValue: groups.high.reduce((sum, r) => sum + r.estimatedAmount!, 0),
      avgValue: groups.high.length > 0
        ? groups.high.reduce((sum, r) => sum + r.estimatedAmount!, 0) / groups.high.length
        : 0,
      count: groups.high.length,
    },
  };
}

function calculatePriceBins(amounts: number[], binCount: number): PriceDistributionBin[] {
  if (amounts.length === 0) {
    return Array.from({ length: binCount }, (_, i) => ({
      binLabel: `Bin ${i + 1}`,
      count: 0,
      minValue: 0,
      maxValue: 0,
    }));
  }

  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const binWidth = (max - min) / binCount;

  const bins: PriceDistributionBin[] = Array.from({ length: binCount }, (_, i) => {
    const minValue = min + i * binWidth;
    const maxValue = i === binCount - 1 ? max : min + (i + 1) * binWidth;

    return {
      binLabel: `${formatCurrencyCompact(minValue)}-${formatCurrencyCompact(maxValue)}`,
      count: 0,
      minValue,
      maxValue,
    };
  });

  // Count claims in each bin
  amounts.forEach((amount) => {
    const binIndex = Math.min(
      binCount - 1,
      Math.floor((amount - min) / binWidth)
    );
    bins[binIndex].count += 1;
  });

  return bins;
}
