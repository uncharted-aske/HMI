import { FacetTermsData, FacetTermsSelection, FacetTermsSubselection } from '@uncharted.software/facets-core/dist/types/facet-terms/FacetTerms';
import { MODEL_TYPE_OPTIONS, COSMOS_TYPE_OPTIONS, COSMOS_INCLUSIVE_OPTIONS } from '@/utils/ModelTypeUtil';

interface ModelMetadataInterface {
  name: string,
  description: string,
  created: string,
  source: string,
  version: string,
  knowledge: string
}
interface ModelComponentMetadataInterface {
  name: string,
  description: string,
  expression: string,
  units: string,
  knowledge: string
}

interface ModelInterface {
  id: number;
  metadata: ModelMetadataInterface,
  graph: any,
  type: string
}

interface TabInterface {
    name: string;
    icon: string;
    id: string;
}

interface ViewInterface {
  name: string;
  id: string;
}

interface ModelsState {
  selectedModelId: string,
  modelsList: ModelInterface[]
}

type LexConvertType = 'integer' | 'string';
type LexConvertTypeMapping = {
  integer: number,
  string: string
}

type QueryFieldKey = string;
interface QueryFieldEntry {
  field: string, // id of query field entry
  display: string, // human readable field name,
  icon?: string, // font-awesome icon to display on search pill
  iconText?: string,
  searchable?: boolean, // searchable fields are queryable from lex
  searchDisplay?: string, // text to display on search
  ranged?: boolean, // if search is ranged
  // baseType/lexType defines the type conversion required from/to base/lex types
  baseType: LexConvertType,
  lexType: LexConvertType
}
type QueryFieldMap = Record<QueryFieldKey, QueryFieldEntry>

type FilterOperand = 'and' | 'or';

interface Filter {
  field: QueryFieldKey, // the logical-field to filter
  values: LexConvertTypeMapping[LexConvertType][], // an array of matching values
  operand: FilterOperand,
  isNot: boolean, // specifies whether the sub-filter should be negated
}

interface Filters {
  clauses: Filter[],
}

interface QueryState {
  filters: string, // JSON representation of Filters interface
}

interface FacetTermsSubselectionMap {
  [key: string]: FacetTermsSubselection;
}

interface FacetTermsSelectionMap {
  [key: string]: FacetTermsSelection;
}

interface FacetTermsDataMap {
  [key: string]: FacetTermsData;
}

type MappedOptions = (
  typeof MODEL_TYPE_OPTIONS |
  typeof COSMOS_TYPE_OPTIONS |
  typeof COSMOS_INCLUSIVE_OPTIONS
);

interface MappedOptionStateConfig {
  mappedOptions: MappedOptions, // Suggestions to be used as mapped options
  [key: string]: any // Interface extends Lex's ValueState.config. TODO: Generate types for Lex
}

export {
  TabInterface,
  ViewInterface,
  ModelInterface,
  ModelMetadataInterface,
  ModelComponentMetadataInterface,
  ModelsState,
  QueryState,
  FacetTermsSubselectionMap,
  FacetTermsSelectionMap,
  FacetTermsDataMap,
  QueryFieldKey,
  QueryFieldEntry,
  QueryFieldMap,
  FilterOperand,
  Filter,
  Filters,
  MappedOptions,
  MappedOptionStateConfig,
  LexConvertType,
  LexConvertTypeMapping,
};
