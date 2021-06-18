
import { traverse } from '@/graphs/svg/util';
import dagre from 'dagre';

export default class DagreAdapter {
    constructor(options) {
      this.nodeWidth = options.nodeWidth;;
      this.nodeHeight = options.nodeHeight;
    }
  
    makeRenderingGraph(graphData) {
      traverse(graphData, (node) => {
        if (! node.nodes) {
          node.width = this.nodeWidth;
          node.height = this.nodeHeight;
        }
        node.data = node;
      }, null);
  
      graphData.edges.forEach(e => {
        e.data = e;
      });
      return graphData;
    }
  
    async run(renderGraph) {
      const g = new dagre.graphlib.Graph({ compound: true });
      g.setGraph({});
      g.setDefaultEdgeLabel(function() { return {}; });
  
      traverse(renderGraph, (n) => {
        if (! n.nodes || n.collapsed === true) {
          g.setNode(n.id, { label: n.label,  width: n.width, height: n.height });
        } else {
          g.setNode(n.id, { label: n.label });
        }
        if (n.nodes) {
          for (let i = 0; i < n.nodes.length; i++) {
            g.setParent(n.nodes[i].id, n.id);
          }
        }
      });

  
      renderGraph.edges.forEach(e => {
        g.setEdge(e.source, e.target);
      });
  
      dagre.layout(g);
      g.nodes().forEach(n => {
        const node = g.node(n);
        node.x -= node.width * 0.5;
        node.y -= node.height * 0.5;
      });
  
      let maxX = 500;
      let maxY = 500;
      traverse(renderGraph, (n) => {
        const node = g.node(n.id);
        const pId = g.parent(n.id);
        n.x = node.x;
        n.y = node.y;
        if (pId) {
          n.x -= g.node(pId).x;
          n.y -= g.node(pId).y;
        }
        n.width = node.width;
        n.height = node.height;
        if (maxX < n.x + n.width) maxX = n.x + n.width;
        if (maxY < n.y + n.height) maxY = n.y + n.height;
      });
  
      renderGraph.edges.forEach(e => {
        const edge = g.edge(e.source, e.target);
        e.points = edge.points;
      });
  
      renderGraph.width = maxX;
      renderGraph.height = maxY;
      console.log(renderGraph);
      return renderGraph;
    }
  }