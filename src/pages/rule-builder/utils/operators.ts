import type { OperatorDefinition, DimensionDataType, RuleOperator } from '@/lib/types/ruleBuilder';

// All available operators
export const OPERATORS: OperatorDefinition[] = [
  // Comparison operators
  { symbol: '=', name: 'equals', category: 'comparison', applicableTypes: ['Number', 'String', 'Date', 'Boolean'] },
  { symbol: '!=', name: 'not equals', category: 'comparison', applicableTypes: ['Number', 'String', 'Date', 'Boolean'] },
  { symbol: '>', name: 'greater than', category: 'comparison', applicableTypes: ['Number', 'Date'] },
  { symbol: '<', name: 'less than', category: 'comparison', applicableTypes: ['Number', 'Date'] },
  { symbol: '>=', name: 'greater or equal', category: 'comparison', applicableTypes: ['Number', 'Date'] },
  { symbol: '<=', name: 'less or equal', category: 'comparison', applicableTypes: ['Number', 'Date'] },

  // Text operators
  { symbol: 'contains', name: 'contains', category: 'text', applicableTypes: ['String'] },
  { symbol: 'starts_with', name: 'starts with', category: 'text', applicableTypes: ['String'] },
  { symbol: 'ends_with', name: 'ends with', category: 'text', applicableTypes: ['String'] },

  // Null operators
  { symbol: 'is_empty', name: 'is empty', category: 'null', applicableTypes: ['Number', 'String', 'Date', 'Boolean'] },
  { symbol: 'is_not_empty', name: 'is not empty', category: 'null', applicableTypes: ['Number', 'String', 'Date', 'Boolean'] },
];

// Grouped operators for panel display
export const OPERATOR_GROUPS = {
  comparison: OPERATORS.filter((op) => op.category === 'comparison'),
  text: OPERATORS.filter((op) => op.category === 'text'),
  null: OPERATORS.filter((op) => op.category === 'null'),
};

// Get operators applicable for a data type
export function getOperatorsForType(dataType: DimensionDataType): OperatorDefinition[] {
  return OPERATORS.filter((op) => op.applicableTypes.includes(dataType));
}

// Get operator definition by symbol
export function getOperatorBySymbol(symbol: string): OperatorDefinition | undefined {
  return OPERATORS.find((op) => op.symbol === symbol);
}

// Check if operator requires a value
export function operatorRequiresValue(operator: RuleOperator): boolean {
  return !['is_empty', 'is_not_empty'].includes(operator);
}

// All operator symbols for tokenizer
export const OPERATOR_SYMBOLS = OPERATORS.map((op) => op.symbol);
