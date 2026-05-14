import { describe, it, expect } from 'vitest'
import { evaluateClaim, computeScoreBounds } from './engine'
import type { ClaimData } from '../types/claim'
import type { TreeNode } from '../types/tree'

const sampleTree: { title: string; root: TreeNode }[] = [
  {
    title: 'Tree #1 — Test',
    root: {
      condition: 'Claim Amount <= 10000',
      true_branch: {
        condition: 'Vehicle Age <= 5',
        true_branch: { value: -2 },
        false_branch: { value: 4 },
      },
      false_branch: {
        condition: 'is Repair Cost High is Yes',
        true_branch: { value: 8 },
        false_branch: { value: 1 },
      },
    },
  },
]

const lowValueClaim: ClaimData = {
  'Claim Amount': 5000,
  'Vehicle Age': 3,
}

const highValueClaim: ClaimData = {
  'Claim Amount': 15000,
  'Repair Cost High': 1,
}

describe('evaluateClaim', () => {
  it('returns a TraceResult with correct fields', () => {
    const result = evaluateClaim(lowValueClaim, sampleTree)

    expect(result).toHaveProperty('claimNumber')
    expect(result).toHaveProperty('paths')
    expect(result).toHaveProperty('totalScore')
    expect(result).toHaveProperty('probability')
    expect(result).toHaveProperty('riskLevel')
  })

  it('evaluates a low-value claim correctly', () => {
    const bounds = computeScoreBounds(sampleTree)
    const result = evaluateClaim(lowValueClaim, sampleTree, bounds)

    expect(result.probability).toBeGreaterThanOrEqual(0)
    expect(result.probability).toBeLessThanOrEqual(1)
  })

  it('scores a high-value claim higher than a low-value claim', () => {
    const bounds = computeScoreBounds(sampleTree)
    const lowResult = evaluateClaim(lowValueClaim, sampleTree, bounds)
    const highResult = evaluateClaim(highValueClaim, sampleTree, bounds)

    expect(highResult.totalScore).toBeGreaterThan(lowResult.totalScore)
    expect(highResult.probability).toBeGreaterThan(lowResult.probability)
  })

  it('includes one path per tree', () => {
    const result = evaluateClaim(lowValueClaim, sampleTree)
    expect(result.paths).toHaveLength(sampleTree.length)
  })

  it('returns "N/A" when Claim Number is not provided', () => {
    const result = evaluateClaim({ 'Claim Amount': 5000 }, sampleTree)
    expect(result.claimNumber).toBe('N/A')
  })
})