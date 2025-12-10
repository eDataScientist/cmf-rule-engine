// Rule Builder Type Definitions

// Operators supported by the rule builder
export type RuleOperator =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'contains'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty';

// Effect levels for rules (required)
export type RuleEffect = 'moderate' | 'high';

// Logical connectors between rules
export type RuleConnector = 'AND' | 'OR';

// Data types for dimensions
export type DimensionDataType = 'Number' | 'String' | 'Date' | 'Boolean';

// Individual rule definition
export interface Rule {
  id: string;
  field: string;
  operator: RuleOperator;
  value: string | number | boolean | null;
  effect: RuleEffect;
}

// Group of rules with a connector
export interface RuleGroup {
  id: string;
  connector: RuleConnector;
  rules: (Rule | RuleGroup)[];
}

// Saved rule set
export interface RuleSet {
  id: string;
  name: string;
  datasetId: number;
  rules: (Rule | RuleGroup)[];
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

// Dimension from dataset (for field palette)
export interface RuleBuilderDimension {
  id: number;
  name: string;
  displayName: string;
  dataType: DimensionDataType;
  category: string;
  isCritical: boolean;
}

// Grouped dimensions by data type (for palette display)
export interface GroupedDimensions {
  Number: RuleBuilderDimension[];
  String: RuleBuilderDimension[];
  Date: RuleBuilderDimension[];
  Boolean: RuleBuilderDimension[];
}

// Token types in Magic Input
export type TokenType = 'field' | 'operator' | 'value' | 'connector' | 'unknown';

// Parsed token from Magic Input
export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}

// Autocomplete suggestion
export interface AutocompleteSuggestion {
  type: TokenType;
  value: string;
  displayValue: string;
  description?: string;
  dataType?: DimensionDataType;
}

// Autocomplete context states
export type AutocompleteContext = 'field' | 'operator' | 'value' | 'connector' | 'none';

// Dragged item state
export interface DraggedItem {
  type: 'field' | 'operator';
  value: string;
  displayValue?: string;
  dataType?: DimensionDataType;
}

// Operator definition for UI
export interface OperatorDefinition {
  symbol: RuleOperator;
  name: string;
  category: 'comparison' | 'text' | 'null';
  applicableTypes: DimensionDataType[];
}

// Distinct values response from edge function
export interface DistinctValuesResponse {
  values: string[] | null;
  totalRows: number;
  uniqueCount: number;
}

// Type guards
export function isRule(item: Rule | RuleGroup): item is Rule {
  return 'field' in item && 'operator' in item;
}

export function isRuleGroup(item: Rule | RuleGroup): item is RuleGroup {
  return 'connector' in item && 'rules' in item;
}
