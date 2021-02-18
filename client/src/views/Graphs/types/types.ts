/* eslint camelcase: 0 */

export interface GraphNodeInterface {
  id: string,
  concept?: string,
  label: string,
  nodeType?: string,
  nodeSubType?: string,
  dataType?:string,
  metadata?: any
}

export interface GraphEdgeInterface {
  id?: string,
  source: string,
  target: string,
  metadata?: any
}

export interface GraphInterface {
  nodes: GraphNodeInterface[],
  edges: GraphEdgeInterface[],
}

export interface ModelGraphInterface {
  abstract: GraphInterface,
  detailed: GraphInterface
}

export interface SubgraphEdgeInterface {
  edgeType: string,
  id: string,
  metadata: any,
  source: string,
  source_label: string,
  target: string,
  target_label: string,
}
