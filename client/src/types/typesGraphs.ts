/* eslint camelcase: 0 */

export interface SVGRendererOptionsInterface {
  el: Vue | Element | Vue[] | Element[], // ref to the HTML element where the graph should get displayed
  adapter: any, // Layout adapter
  renderMode: string, // basic or delta
  useEdgeControl?: boolean,
  edgeControlOffset?: number,
  useMinimap?: boolean,
  useZoom?: boolean,
  addons?: any
}

export interface GraphNodeDataInterface {
  belief: number,
  cluster_ids: number,
  cluster_level: number,
  db_ids: {namespace: string, id: string }[],
  doc_ids: number,
  doi_map: number,
  edge_ids_source: number[],
  edge_ids_target: number[],
  evidence_ids: number,
  grafer_id: number,
  grounded: boolean,
  grounded_cluster: number,
  grounded_onto: boolean,
  id: number,
  in_degree: number,
  inter_edge_id: number,
  intra_edge_id: number,
  label: string,
  model_id: number,
  ontocat_ids: number[],
  ontocat_level: number,
  ontocat_map: Record<any, any>,
  out_degree: number,
  source_id: number,
  statement_id: number,
  target_id: number,
  tested: boolean,
  type: string,
  _id: string,
  _type: string,
}

export interface GraphNodeInterface {
id: string,
concept?: string,
label: string,
nodeType?: string,
nodeSubType?: string,
dataType?:string,
data?: GraphNodeDataInterface,
metadata?: any,
}

export interface GraphEdgeInterface {
id?: string,
source: string,
target: string,
edgeType?: string,
data?: any
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
  id?: string,
  source: string,
  target: string,
}

export interface SubgraphNodeInterface {
id: string,
}

export interface SubgraphInterface {
nodes: SubgraphNodeInterface[],
edges: SubgraphEdgeInterface[],
}
