/**
 * Define Types used for Computational Models
 */

import * as Graph from '@/types/typesGraphs';
import * as GroMEt from '@/types/typesGroMEt';

type Metadata = {
  created?: string,
  description?: string,
  knowledge?: string
  id?: string,
  name: string,
  source?: string,
  type?: string, // Mostly used by DONU
  version?: string,
};

type GraphMetadata = GroMEt.ModelInterface | GroMEt.CodeCollectionInterface | GroMEt.TextualDocumentReferenceSet;

enum GraphTypes {
  PetriNetClassic = 'PetriNetClassic',
  FunctionNetwork = 'FunctionNetwork',
}

/* Define a graph (nodes and edges) per type of a model. */
type Graph = {
  file: string,
  type: GraphTypes,
  metadata?: Array<GraphMetadata>,
  graph: Graph.GraphInterface,
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
