import { describe, expect, it } from 'vitest';
import { parseFIGS } from './figs';

describe('parseFIGS', () => {
  it('parses space-indented FIGS trees', () => {
    const trees = parseFIGS(`
AtFaultStatus_Not At Fault <= 0.500 (Tree #0 root)
 FinancialRowCount <= 1.500 (split)
  Val: -0.042 (leaf)
  Val: -0.05 (leaf)
 InsuredVehicleValueClassOrdinal <= 4.500 (split)
  Val: -0.028 (leaf)
  Val: -0.017 (leaf)

 +
EstimateValue <= 12290.705 (Tree #1 root)
 Val: -0.005 (leaf)
 Val: 0.011 (leaf)
`);

    expect(trees).toHaveLength(2);
    expect(trees[0].root).toMatchObject({
      true_branch: { condition: 'FinancialRowCount <= 1.500' },
    });
  });
});
