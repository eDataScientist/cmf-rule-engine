import type { TreeNode } from '@/lib/types/tree';
import { isLeafNode } from '@/lib/types/tree';

export type ParsedOperator = 'lte' | 'gte' | 'lt' | 'gt' | 'is';

export interface ParsedCondition {
  feature: string;
  operator: ParsedOperator;
  value: string;
  rawValue: string;
}

export function parseCondition(condition: string): ParsedCondition | null {
  const trimmed = condition.trim();

  const lteMatch = trimmed.match(/^(.+?)\s*<=\s*(.+)$/);
  if (lteMatch) {
    return {
      feature: lteMatch[1].trim(),
      operator: 'lte',
      value: lteMatch[2].trim(),
      rawValue: lteMatch[2].trim(),
    };
  }

  const gteMatch = trimmed.match(/^(.+?)\s*>=\s*(.+)$/);
  if (gteMatch) {
    return {
      feature: gteMatch[1].trim(),
      operator: 'gte',
      value: gteMatch[2].trim(),
      rawValue: gteMatch[2].trim(),
    };
  }

  const ltMatch = trimmed.match(/^(.+?)\s*<\s*(.+)$/);
  if (ltMatch) {
    return {
      feature: ltMatch[1].trim(),
      operator: 'lt',
      value: ltMatch[2].trim(),
      rawValue: ltMatch[2].trim(),
    };
  }

  const gtMatch = trimmed.match(/^(.+?)\s*>\s*(.+)$/);
  if (gtMatch) {
    return {
      feature: gtMatch[1].trim(),
      operator: 'gt',
      value: gtMatch[2].trim(),
      rawValue: gtMatch[2].trim(),
    };
  }

  const isMatch = trimmed.match(/^(.+?)\s+is\s+(.+)$/i);
  if (isMatch) {
    return {
      feature: isMatch[1].trim(),
      operator: 'is',
      value: isMatch[2].trim(),
      rawValue: isMatch[2].trim(),
    };
  }

  return null;
}

export function formatNumeric(value: string): string {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;
  if (Number.isInteger(numeric)) return numeric.toString();
  return numeric.toFixed(3).replace(/\.?0+$/, '');
}

export function formatTrueLabel(condition: ParsedCondition): string {
  switch (condition.operator) {
    case 'lte':
      return `≤ ${formatNumeric(condition.value)}`;
    case 'lt':
      return `< ${formatNumeric(condition.value)}`;
    case 'gte':
      return `≥ ${formatNumeric(condition.value)}`;
    case 'gt':
      return `> ${formatNumeric(condition.value)}`;
    case 'is':
      return `is ${condition.value}`;
    default:
      return condition.rawValue;
  }
}

export function formatFalseLabel(condition: ParsedCondition): string {
  switch (condition.operator) {
    case 'lte':
      return `> ${formatNumeric(condition.value)}`;
    case 'lt':
      return `≥ ${formatNumeric(condition.value)}`;
    case 'gte':
      return `< ${formatNumeric(condition.value)}`;
    case 'gt':
      return `≤ ${formatNumeric(condition.value)}`;
    case 'is': {
      const value = condition.value.toLowerCase();
      if (value === 'yes') return 'is No';
      if (value === 'no') return 'is Yes';
      if (value === 'true') return 'is False';
      if (value === 'false') return 'is True';
      return `is not ${condition.value}`;
    }
    default:
      return condition.rawValue;
  }
}

export function getMinMaxLeafValues(trees: { title: string; root: TreeNode }[]): { min: number; max: number } {
  const values: number[] = [];

  function traverse(node: TreeNode) {
    if (isLeafNode(node)) {
      values.push(node.value);
      return;
    }
    traverse(node.true_branch);
    traverse(node.false_branch);
  }

  trees.forEach(tree => traverse(tree.root));

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}
