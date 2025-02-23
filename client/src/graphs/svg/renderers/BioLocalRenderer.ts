import * as d3 from 'd3';

import { SVGRenderer } from 'svg-flowgraph';

import { SVGRendererOptionsInterface, SubgraphInterface } from '@/types/typesGraphs';

import { calcEdgeColor, calcEdgeControlBackground, flatten } from '@/graphs/svg/util';
import { Colors, EdgeTypes } from '@/graphs/svg/encodings';
import SVGUtil from '@/utils/SVGUtil';
import { truncateString } from '@/utils/StringUtil';

const pathFn = SVGUtil.pathFn().curve(d3.curveBasis);

const DEFAULT_STYLE = {
  node: {
    fill: Colors.NODES.DEFAULT,
    stroke: Colors.STROKE,
    strokeWidth: 1,
    borderRadius: 5,
  },
  edge: {
    fill: 'none',
    strokeWidth: 5,
    controlRadius: 6,
    controlStrokeWidth: 2,
    controlStrokeColor: Colors.NODES.DEFAULT,
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
      .filter(d => (d as any).data.statement_type !== EdgeTypes.EDGES.COMPLEX)
      .attr('id', d => {
        const source = (d as any).source.toString().replace(/\s/g, '');
        const target = (d as any).target.toString().replace(/\s/g, '');
        const type = (d as any).data.statement_type;
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
      .filter(d => (d as any).data.statement_type === EdgeTypes.EDGES.COMPLEX)
      .attr('id', d => {
        const source = (d as any).source.toString().replace(/\s/g, '');
        const target = (d as any).target.toString().replace(/\s/g, '');
        const type = (d as any).data.statement_type;
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

      selection.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('rx', DEFAULT_STYLE.node.borderRadius)
        .attr('width', d => (d as any).width)
        .attr('height', d => (d as any).height)
        .style('fill', d => (d as any).nodes ? '' : DEFAULT_STYLE.node.fill)
        .style('stroke', DEFAULT_STYLE.node.stroke)
        .style('stroke-width', d => (d as any).nodes ? 5 : DEFAULT_STYLE.node.strokeWidth);

      selection.append('text')
        .attr('x', d => (d as any).nodes ? 0 : 0.5 * (d as any).width)
        .attr('y', d => (d as any).nodes ? -5 : 25)
        .style('font-weight', d => (d as any).nodes ? '800' : '500')
        .style('text-anchor', d => (d as any).nodes ? 'left' : 'middle')
        .text(d => truncateString((d as any).label, 10));
    });
  }

  renderEdgeControl (edgeSelection:d3.Selection<any, any, any, any>):void {
    edgeSelection.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', DEFAULT_STYLE.edge.controlRadius)
      .attr('fill', '#FFFFFF')
      .attr('fill', d => calcEdgeControlBackground(d))
      .attr('stroke', 'white')
      .attr('stroke-width', DEFAULT_STYLE.edge.controlStrokeWidth);
  }

  renderEdge (edgeSelection:d3.Selection<any, any, any, any>):void {
    edgeSelection.append('path')
      .attr('d', d => pathFn(d.points))
      .style('fill', DEFAULT_STYLE.edge.fill)
      .style('stroke-width', DEFAULT_STYLE.edge.strokeWidth)
      .style('stroke', d => calcEdgeColor(d))
      .attr('marker-end', d => {
        const source = d.source.toString().replace(/\s/g, '');
        const target = d.target.toString().replace(/\s/g, '');
        const type = (d as any).data.statement_type;
        return `url(#arrowhead-${source}-${target}-${type})`;
      })
      .attr('marker-start', d => {
        const source = d.source.toString().replace(/\s/g, '');
        const target = d.target.toString().replace(/\s/g, '');
        const type = (d as any).data.statement_type;
        return `url(#start-${source}-${target}-${type})`;
      });
  }

  hideSubgraph (): void {
    const chart = (this as any).chart;
    chart.selectAll('.node-ui,.edge').style('opacity', 1);
  }

  showSubgraph (subgraph: SubgraphInterface): void {
    const chart = (this as any).chart;
    const nodes = subgraph.nodes;
    const edges = subgraph.edges;
    chart.selectAll('.edge').each(function (d) {
      const isNeighbour = edges.some(edge =>
        edge.source === d.source && edge.target === d.target);
      d3.select(this).style('opacity', isNeighbour ? '1' : '0.1');
    });
    chart.selectAll('.node-ui').each(function (d) {
      const isNeighbour = nodes.map(node => node).includes(d.id);
      d3.select(this).style('opacity', isNeighbour ? '1' : '0.1');
    });
  }

  selectNode (node: d3.Selection<any, any, any, any>): void {
    node.select('rect')
      .style('stroke', Colors.HIGHLIGHT)
      .style('stroke-width', DEFAULT_STYLE.node.strokeWidth + 3);
  }

  clearSelections ():void {
    const chart = (this as any).chart;
    chart.selectAll('rect')
      .style('stroke', DEFAULT_STYLE.node.stroke)
      .style('stroke-width', DEFAULT_STYLE.node.strokeWidth);
  }
}
