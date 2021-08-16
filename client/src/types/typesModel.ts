/**
 * Define Types used for Computational Models
 */

import * as HMI from '@/types/types';
import * as Donu from '@/types/typesDonu';
import * as Graph from '@/types/typesGraphs';
import * as GroMEt from '@/types/typesGroMEt';
import * as BGraph from '@/types/typesBGraph';

type Metadata = {
  created?: string,
  description?: string,
  knowledge?: string
  id?: string,
  name: string,
  version?: string,
};

type GraphMetadata = GroMEt.ModelInterface | GroMEt.CodeCollectionInterface | GroMEt.TextualDocumentReferenceSet;

enum GraphTypes {
  PetriNetClassic = 'PetriNetClassic',
  FunctionNetwork = 'FunctionNetwork',
}

/* Define a graph (nodes and edges) per type of a model. */
type Graph = {
  donuType: Donu.Type,
  graph: Graph.GraphInterface,
  bgraph: BGraph.BGraphInputDataInterface,
  model: string,
  metadata?: Array<GraphMetadata>,
  type: GraphTypes,
  overlappingElements?: Graph.SubgraphInterface,
};

type Model = {
  id: number,
  name: string,
  modelGraph?: Graph[],
  metadata?: Metadata,
};

type State = {
  isInitialized: boolean,
  modelsList: Model[],
  selectedModelGraphType?: GraphTypes,
  selectedModelIds: Set<string>,
  modelsLayout: string,
};

interface ViewInterface extends HMI.ViewInterface {
  id: GraphTypes;
}

const GRAPHTYPE_VIEWS: ViewInterface[] = [
  { name: 'Petri Net Classic', id: GraphTypes.PetriNetClassic },
  { name: 'Functional Network', id: GraphTypes.FunctionNetwork },
];

export {
  Graph,
  GraphMetadata,
  GraphTypes,
  Model,
  ViewInterface,
  Metadata,
  State,
  GRAPHTYPE_VIEWS,
};
