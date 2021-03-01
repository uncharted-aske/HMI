/* eslint camelcase: 0 */

export interface EpiModelRendererOptionsInterface {
  el: Vue | Element | Vue[] | Element[], // ref to the HTML element where the graph should get displayed
  adapter: any, // Layout adapter
  renderMode: string, // basic or delta
}

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
edgeType?: string,
id?: string,
metadata?: any,
source: string,
source_label?: string,
target: string,
target_label?: string,
}

export interface SubgraphNodeInterface {
id: string,
}

export interface SubgraphInterface {
nodes: SubgraphNodeInterface[],
edges: SubgraphEdgeInterface[],
}
