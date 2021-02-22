export interface EpiModelRendererOptionsInterface {
    el: Vue | Element | Vue[] | Element[], // ref to the HTML element where the graph should get displayed
    adapter: any, // Layout adapter
    renderMode: string, // basic or delta
}

export interface SubgraphNodeInterface {
  id: string,
}

export interface SubgraphEdgeInterface {
  source: string, // Source node ID
  target: string, // Target node ID
}

export interface SubgraphInterface {
  nodes: SubgraphNodeInterface[],
  edges: SubgraphEdgeInterface[],
}
