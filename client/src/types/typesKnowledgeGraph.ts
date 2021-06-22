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
  version?: string,
}

type Graph = {
  graph?: any,
  id?: number;
  metadata: Metadata,
  subgraph?: any,
};

export {
  Graph,
  Metadata,
};
