export interface GraphNodeInterface {
  id: string,
  concept: string,
  label: string,
  type: string,
  metadata: any
}

export interface GraphEdgeInterface {
  id: string,
  source: string,
  target: string
}

export interface GraphGroupInterface {
  id: string,
  members: string[]
}

export interface GraphInterface {
  nodes: GraphNodeInterface[],
  edges: GraphEdgeInterface[],
}

export interface ModelGraphInterface {
  abstract: GraphInterface,
  detailed: GraphInterface
}
