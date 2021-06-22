/**
 * Define Types used for Computional Models
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

/* Define a graph (nodes and edges) per type of a model. */
type Graph = {
  file: string,
  type: 'PetriNetClassic' | 'FunctionNetwork',
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
  Model,
  Metadata,
  State,
};
