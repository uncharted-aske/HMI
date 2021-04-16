import { MODEL_TYPE_OPTIONS, COSMOS_TYPE_OPTIONS, BOOLEAN_OPTIONS } from '@/utils/ModelTypeUtil';

export type LexConvertType = 'integer' | 'string';
export type LexConvertTypeMapping = {
  integer: number,
  string: string
}

export type QueryFieldKey = string;
export interface QueryFieldEntry {
  field: string, // id of query field entry
  display: string, // human readable field name,
  icon?: string, // font-awesome icon to display on search pill
  iconText?: string,
  searchable?: boolean, // searchable fields are queryable from lex
  searchDisplay?: string, // text to display on search
  ranged?: boolean, // if search is ranged
  order?: number, // used to sort fields
  // baseType/lexType defines the type conversion required from/to base/lex types
  baseType: LexConvertType,
  lexType: LexConvertType
}
export type QueryFieldMap = Record<QueryFieldKey, QueryFieldEntry>

export type FilterOperand = 'and' | 'or';

export interface Filter {
  field: QueryFieldKey, // the logical-field to filter
  values: LexConvertTypeMapping[LexConvertType][], // an array of matching values
  operand: FilterOperand,
  isNot: boolean, // specifies whether the sub-filter should be negated
}

export interface Filters {
  clauses: Filter[],
}

export interface QueryState {
  filters: string, // JSON representation of Filters interface
}

export type MappedOptions = (
  typeof MODEL_TYPE_OPTIONS |
  typeof COSMOS_TYPE_OPTIONS |
  typeof BOOLEAN_OPTIONS
)

export interface MappedOptionStateConfig {
  mappedOptions: MappedOptions, // Suggestions to be used as mapped options
  [key: string]: any // Interface extends Lex's ValueState.config. TODO: Generate types for Lex
}
