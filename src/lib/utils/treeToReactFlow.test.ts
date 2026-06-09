import { describe, expect, it } from 'vitest';
import { treeToReactFlow } from './treeToReactFlow';
import type { TreeNode } from '@/lib/types/tree';

const leaf = (value: number): TreeNode => ({ value });

describe('treeToReactFlow', () => {
  it('keeps sparse deep branches compact instead of reserving unused leaf slots', () => {
    const sparseTree: TreeNode = {
      condition: 'Root <= 1',
      true_branch: {
        condition: 'DeepLeft <= 1',
        true_branch: {
          condition: 'DeepLeftA <= 1',
          true_branch: {
            condition: 'DeepLeftAA <= 1',
            true_branch: leaf(0.1),
            false_branch: leaf(0.2),
          },
          false_branch: leaf(0.3),
        },
        false_branch: leaf(0.4),
      },
      false_branch: leaf(0.5),
    };

    const { nodes } = treeToReactFlow(sparseTree);
    const xs = nodes.map((node) => node.position.x);
    const visualWidth = Math.max(...xs) - Math.min(...xs);

    expect(visualWidth).toBeLessThan(720);
  });

  it('preserves two-level horizontal spacing for deeper trees', () => {
    const deepTree: TreeNode = {
      condition: 'Root <= 1',
      true_branch: {
        condition: 'Left <= 1',
        true_branch: {
          condition: 'LeftLeft <= 1',
          true_branch: leaf(0.1),
          false_branch: leaf(0.2),
        },
        false_branch: {
          condition: 'LeftRight <= 1',
          true_branch: leaf(0.3),
          false_branch: leaf(0.4),
        },
      },
      false_branch: {
        condition: 'Right <= 1',
        true_branch: {
          condition: 'RightLeft <= 1',
          true_branch: leaf(0.5),
          false_branch: leaf(0.6),
        },
        false_branch: {
          condition: 'RightRight <= 1',
          true_branch: leaf(0.7),
          false_branch: leaf(0.8),
        },
      },
    };

    const { nodes } = treeToReactFlow(deepTree);
    const deepestLeafXs = nodes
      .filter((node) => node.type === 'leaf' && node.position.y === 450)
      .map((node) => node.position.x)
      .sort((a, b) => a - b);

    const adjacentGaps = deepestLeafXs.slice(1).map((x, index) => x - deepestLeafXs[index]);

    expect(deepestLeafXs).toHaveLength(8);
    expect(Math.min(...adjacentGaps)).toBeGreaterThanOrEqual(200);
  });
});
