/**
 * Define Types used for Computational Models
 */

import * as Donu from '@/types/typesDonu';
import * as Graph from '@/types/typesGraphs';
import * as GroMEt from '@/types/typesGroMEt';

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
  model: string,
  metadata?: Array<GraphMetadata>,
  type: GraphTypes,
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
  selectedModelGraph?: number,
  selectedModelIds: Set<string>,
};

export {
  Graph,
  GraphMetadata,
  GraphTypes,
  Model,
  Metadata,
  State,
};
