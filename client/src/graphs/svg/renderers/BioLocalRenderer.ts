import * as d3 from 'd3';

import { SVGRenderer } from 'svg-flowgraph';

import { SVGRendererOptionsInterface } from '@/types/typesGraphs';

import { calcEdgeColor, flatten } from '@/graphs/svg/util';
import { Colors, EdgeTypes } from '@/graphs/svg/encodings';
import SVGUtil from '@/utils/SVGUtil';

const pathFn = SVGUtil.pathFn.curve(d3.curveBasis);

const DEFAULT_STYLE = {
  node: {
    fill: Colors.NODES.DEFAULT,
    stroke: Colors.STROKE,
  },
  edge: {
    fill: 'none',
    strokeWidth: 5,
  },
};

export default class BioLocalRenderer extends SVGRenderer {
  constructor (options:SVGRendererOptionsInterface) {
    super(options);
  }

  buildDefs (): void {
    const svg = d3.select((this as any).svgEl);
    const edges = flatten((this as any).layout).edges;

    // Clean up
    svg.select('defs').selectAll('.edge-marker-end').remove();

    const defs = svg.select('defs')
      .selectAll('.edge-marker-end')
      .data(edges)
      .enter()
      .append('marker')
      .classed('edge-marker-end', true);

    // Arrowheads
    defs
      .filter(d => (d as any).data.edgeType !== EdgeTypes.EDGES.COMPLEX)
      .attr('id', d => {
        const source = (d as any).source.replace(/\s/g, '');
        const target = (d as any).target.replace(/\s/g, '');
        const type = (d as any).data.edgeType;
        return `arrowhead-${source}-${target}-${type}`;
      })
      .attr('viewBox', SVGUtil.MARKER_VIEWBOX)
      .attr('refX', 2)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 15)
      .attr('markerHeight', 15)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', SVGUtil.ARROW)
      .style('fill', d => calcEdgeColor(d))
      .style('stroke', 'none');

    // Circles
    defs
      .filter(d => (d as any).data.edgeType === EdgeTypes.EDGES.COMPLEX)
      .attr('id', d => {
        const source = (d as any).source.replace(/\s/g, '');
        const target = (d as any).target.replace(/\s/g, '');
        const type = (d as any).data.edgeType;
        return `arrowhead-${source}-${target}-${type}`;
      })
      .attr('viewBox', SVGUtil.MARKER_VIEWBOX)
      .attr('refX', 2)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 15)
      .attr('markerHeight', 15)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('xoverflow', 'visible')
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 3)
      .style('fill', d => calcEdgeColor(d));
  }

  renderNode (nodeSelection: d3.Selection<any, any, any, any>): void {
    nodeSelection.each(function () {
      const selection = d3.select(this);

      if ((selection.datum() as any).nodes) {
        selection.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', d => (d as any).width)
          .attr('height', d => (d as any).height)
          .style('fill', '#EEF')
          .style('stroke', '#888');
      } else {
        selection.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', d => (d as any).width)
          .attr('height', d => (d as any).height)
          .style('fill', DEFAULT_STYLE.node.fill)
          .style('stroke', DEFAULT_STYLE.node.stroke);
      }
    });
    nodeSelection.append('text')
      .attr('x', d => d.nodes ? 0 : 0.5 * d.width)
      .attr('y', d => d.nodes ? -5 : 25)
      .style('fill', '#333')
      .style('font-weight', '600')
      .style('text-anchor', d => d.nodes ? 'left' : 'middle')
      .text(d => d.label); // FIXME: Create a string util for truncation
  }

  renderEdge (edgeSelection:d3.Selection<any, any, any, any>):void {
    edgeSelection.append('path')
      .attr('d', d => pathFn(d.points))
      .style('fill', DEFAULT_STYLE.edge.fill)
      .style('stroke-width', DEFAULT_STYLE.edge.strokeWidth)
      .style('stroke', d => calcEdgeColor(d))
      .attr('marker-end', d => {
        const source = d.source.replace(/\s/g, '');
        const target = d.target.replace(/\s/g, '');
        const type = (d as any).data.edgeType;
        return `url(#arrowhead-${source}-${target}-${type})`;
      })
      .attr('marker-start', d => {
        const source = d.source.replace(/\s/g, '');
        const target = d.target.replace(/\s/g, '');
        const type = (d as any).data.edgeType;
        return `url(#start-${source}-${target}-${type})`;
      });
  }

  //   hideNeighbourhood (): void {
  //     const chart = this.chart;
  //     chart.selectAll('.node-ui').style('opacity', 1);
  //     chart.selectAll('.edge').style('opacity', 1);
  //   }

  //   showNeighborhood (subgraph: SubgraphInterface): void {
  //     const chart = this.chart;
  //     // FIXME: not very efficient
  //     const nodes = subgraph.nodes;
  //     const edges = subgraph.edges;
  //     const nonNeighborNodes = chart.selectAll('.node-ui').filter(d => !nodes.map(node => node.id).includes(d.id));
  //     nonNeighborNodes.style('opacity', 0.1);

//     const nonNeighborEdges = chart.selectAll('.edge').filter(d => !_.some(edges, edge => edge.source === d.source && edge.target === d.target));
//     nonNeighborEdges.style('opacity', 0.1);
//   }
}
