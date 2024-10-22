/**
 * Define Types used for the Knowledge Graphs
 */

interface Metadata {
  created?: string,
  description?: string,
  knowledge?: string
  id?: string,
  name: string,
  source?: string,
  type?: string, // Mostly used by DONU
  version?: string,
}

type Graph = {
  graph?: any,
  id?: number;
  metadata: Metadata,
  subgraph?: any,
};

type State = {
  isInitialized: boolean,
  graphsList: Graph[],
  selectedGraph?: string,
  selectedGraphIds: Set<string>,
};

export {
  Graph,
  Metadata,
  State,
};
