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

interface GraphNodeInterface {
  id: string,
  concept: string,
  label: string,
  type: string,
  metadata: any
}

interface GraphEdgeInterface {
  id: string,
  source: string,
  target: string
}

interface GraphGroupInterface {
  id: string,
  members: string[]
}

interface GraphInterface {
  nodes: GraphNodeInterface[],
  edges: GraphEdgeInterface[],
  groups: GraphGroupInterface[]
}

interface ModelGraphInterface {
  abstract: GraphInterface,
  detailed: GraphInterface
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

interface CardInterface {
  id: number;
  previewImageSrc: string,
  title: string;
  subtitle: string;
  type: string;
}

interface ModelsState {
  selectedModelId: string,
  modelsList: ModelInterface[]
}

interface QueryState {
  [filters: string]: string, // JSON
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

export {
  ActionColumnInterface,
  CardInterface,
  ModelInterface,
  ModelMetadataInterface,
  ModelGraphInterface,
  ModelComponentMetadataInterface,
  GraphNodeInterface,
  GraphEdgeInterface,
  GraphInterface,
  ModelsState,
  QueryState,
  FacetTermsSubselectionMap,
  FacetTermsSelectionMap,
  FacetTermsDataMap,
  QueryFieldKey,
  QueryFieldEntry,
  QueryFieldMap,
};
