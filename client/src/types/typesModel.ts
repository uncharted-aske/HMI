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

type ModelComparisonData = {
  apex: string,
  legs: {
    [key: string]: {
      [key: string]: string,
    }[]
  }
};

type ModelComparisonMap = {
  [key: string]: { // Compare Against Model ID (name)
    [key: string]: { // Compare To Model ID (name)
      [key: string]: string[], // Compare Against Node ID (name): Compare To Node ID (name)[]
    }
  }
};

type SelectedNode = {
  model: number,
  node: string,
};

type State = {
  isInitialized: boolean,
  modelsList: Model[],
  selectedModelGraphType?: GraphTypes,
  selectedModelIds: Set<number>,
  selectedNodes: SelectedNode[],
  modelsLayout: string,
};

interface ViewInterface extends HMI.ViewInterface {
  id: GraphTypes;
}

const GRAPHTYPE_VIEWS: ViewInterface[] = [
  { name: 'Petri Net Classic', id: GraphTypes.PetriNetClassic },
  { name: 'Function Network', id: GraphTypes.FunctionNetwork },
];

export {
  Graph,
  GraphMetadata,
  GraphTypes,
  Model,
  ViewInterface,
  Metadata,
  ModelComparisonData,
  ModelComparisonMap,
  SelectedNode,
  State,
  GRAPHTYPE_VIEWS,
};
