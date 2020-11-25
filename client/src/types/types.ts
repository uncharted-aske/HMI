import { FacetTermsData, FacetTermsSelection, FacetTermsSubselection } from '@uncharted.software/facets-core/dist/types/facet-terms/FacetTerms';

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

interface ActionColumnInterface {
    name: string;
    icon: string;
    paneId: string;
}

interface ModelsState {
  selectedModelId: string,
  modelsList: ModelInterface[]
}

type QueryFieldKey = 'MODEL_TYPE';
interface QueryFieldEntry {
  field: string, // id of query field entry
  display: string, // human readable field name,
  icon?: string, // font-awesome icon to display on search pill
  iconText?: string,
  searchable?: boolean, // searchable fields are queryable from lex
  searchDisplay?: string, // text to display on search
  ranged?: boolean, // if search is ranged
  // baseType/lexType defines the type conversion required from/to base/lex types
  baseType: string,
  lexType: string
}
type QueryFieldMap = Record<QueryFieldKey, QueryFieldEntry>

type FilterOperand = 'and' | 'or';

interface Filter {
  field: QueryFieldKey, // the logical-field to filter
  values: (string | number)[], // an array of matching values
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

interface BinningDegreeConfigInterface {
  binIn?: boolean;
  binOut?: boolean;
  binCountIn?: number;
  binCountOut?: number;
  binType?: string;
  binMaxIn?: number;
  binMaxOut?: number;
  binMinIn?: number;
  binMinOut?: number;
}

interface EdgeInterface {
  id: number,
  source: string,
  target: string,
}

interface GraphInterface {
  metadata: unknown,
  nodes: Array<any>,
  edges: Array<EdgeInterface>,
}

export {
  ActionColumnInterface,
  ModelInterface,
  ModelMetadataInterface,
  ModelComponentMetadataInterface,
  ModelsState,
  QueryState,
  FacetTermsSubselectionMap,
  FacetTermsSelectionMap,
  FacetTermsDataMap,
  BinningDegreeConfigInterface,
  GraphInterface,
  EdgeInterface,
  QueryFieldKey,
  QueryFieldEntry,
  QueryFieldMap,
  FilterOperand,
  Filter,
  Filters,
};
