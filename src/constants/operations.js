/**
 * Operation type definitions.
 * Each entry defines the label, color theme, and default config
 * for a pipeline step type.
 */

export const OPERATION_TYPES = {
  filter: {
    label: 'Filter',
    description: 'Keep rows matching a condition',
    color: 'green',
    defaultConfig: { column: '', operator: 'contains', value: '' },
  },
  rename: {
    label: 'Rename',
    description: 'Rename a column',
    color: 'blue',
    defaultConfig: { from: '', to: '' },
  },
  drop_column: {
    label: 'Drop Column',
    description: 'Remove a column from output',
    color: 'red',
    defaultConfig: { column: '' },
  },
  add_column: {
    label: 'Add Column',
    description: 'Derive a new column via JS expression',
    color: 'cyan',
    defaultConfig: { newColumn: '', expression: '' },
  },
  sort: {
    label: 'Sort',
    description: 'Order rows by a column value',
    color: 'purple',
    defaultConfig: { column: '', direction: 'asc' },
  },
  deduplicate: {
    label: 'Deduplicate',
    description: 'Remove duplicate rows',
    color: 'yellow',
    defaultConfig: { column: '__all__' },
  },
  transform: {
    label: 'Transform',
    description: 'Apply a transformation to a column',
    color: 'orange',
    defaultConfig: { column: '', transform: 'trim' },
  },
  limit: {
    label: 'Limit',
    description: 'Cap the number of output rows',
    color: 'pink',
    defaultConfig: { count: 100 },
  },
};

export const FILTER_OPERATORS = [
  { value: 'equals',       label: 'equals' },
  { value: 'not_equals',   label: 'not equals' },
  { value: 'contains',     label: 'contains' },
  { value: 'not_contains', label: 'not contains' },
  { value: 'starts_with',  label: 'starts with' },
  { value: 'ends_with',    label: 'ends with' },
  { value: 'greater_than', label: '>' },
  { value: 'less_than',    label: '<' },
  { value: 'not_empty',    label: 'is not empty' },
  { value: 'is_empty',     label: 'is empty' },
];

export const TRANSFORM_TYPES = [
  { value: 'trim',      label: 'Trim whitespace' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'to_number', label: 'To number' },
  { value: 'to_string', label: 'To string' },
  { value: 'round',     label: 'Round (2 dp)' },
  { value: 'abs',       label: 'Absolute value' },
];

export const OUTPUT_TARGETS = {
  csv: { label: 'CSV File',  description: 'Download as .csv' },
  db:  { label: 'Database',  description: 'Write to in-memory table' },
};

/** Color token map to CSS variable names */
export const COLOR_MAP = {
  green:  { bg: 'var(--green-dim)',   border: 'var(--green-border)', text: 'var(--green)' },
  blue:   { bg: 'var(--accent-dim)',  border: 'var(--accent)',       text: 'var(--accent-text)' },
  red:    { bg: 'var(--red-dim)',     border: 'var(--red-border)',   text: 'var(--red)' },
  cyan:   { bg: 'var(--cyan-dim)',    border: '#0d3530',             text: 'var(--cyan)' },
  purple: { bg: 'var(--purple-dim)',  border: '#3a2060',             text: 'var(--purple)' },
  yellow: { bg: 'var(--yellow-dim)',  border: '#403000',             text: 'var(--yellow)' },
  orange: { bg: 'var(--orange-dim)',  border: '#402010',             text: 'var(--orange)' },
  pink:   { bg: 'var(--pink-dim)',    border: '#401828',             text: 'var(--pink)' },
};
