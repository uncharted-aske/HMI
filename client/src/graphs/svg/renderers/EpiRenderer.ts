import * as d3 from 'd3';

import { SVGRenderer } from 'svg-flowgraph';

import { SVGRendererOptionsInterface, SubgraphInterface, SubgraphNodeInterface } from '@/types/typesGraphs';

import { calcLabelColor, flatten } from '@/graphs/svg/util';
import { Colors, NodeTypes } from '@/graphs/svg/encodings';
import SVGUtil from '@/utils/SVGUtil';

const pathFn = SVGUtil.pathFn().curve(d3.curveBasis);

const DEFAULT_STYLE = {
  node: {
    fill: Colors.NODES.DEFAULT,
    stroke: Colors.STROKE,
    strokeWidth: 2,
    borderRadius: 5,
  },
  edge: {
    fill: 'none',
    stroke: Colors.EDGES.DEFAULT,
    strokeWidth: 5,
    controlRadius: 6,
    controlStrokeWidth: 2,
    controlStrokeColor: Colors.NODES.DEFAULT,
  },
};

export default class EpiRenderer extends SVGRenderer {
  constructor (options:SVGRendererOptionsInterface) {
    super(options);
  }

  static calcNodeColor (d: d3.Selection<any, any, any, any>): string {
    return (d as any).nodes ? Colors.NODES.CONTAINER : DEFAULT_STYLE.node.fill;
  }

  static calcNodeStrokeStyle (d: d3.Selection<any, any, any, any>): string {
    return !(d as any).nodes && !(d as any).data.role?.includes(NodeTypes.NODES.VARIABLE) ? '5,5' : null;
  }

  static calcNodeStrokeWidth (d: d3.Selection<any, any, any, any>): number {
    return !(d as any).nodes && !(d as any).data.role?.includes(NodeTypes.NODES.VARIABLE) ? DEFAULT_STYLE.node.strokeWidth + 1 : DEFAULT_STYLE.node.strokeWidth;
  }

  buildDefs (): void {
    const svg = d3.select((this as any).svgEl);
    const edges = flatten((this as any).layout).edges;

    // Clean up
    svg.select('defs').selectAll('.edge-marker-end').remove();

    // Arrowheads for edges
    svg.select('defs')
      .selectAll('.edge-marker-end')
      .data(edges)
      .enter()
      .append('marker')
      .classed('edge-marker-end', true)
      .attr('id', d => {
        const source = (d as any).source.replace(/\s/g, '');
        const target = (d as any).target.replace(/\s/g, '');
        return `arrowhead-${source}-${target}`;
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
      .style('fill', Colors.EDGES.DEFAULT)
      .style('stroke', 'none');

    // Create filter with id #drop-shadow for containers
    // height=130% so that the shadow is not clipped
    const filter = svg.select('defs').append('filter')
      .attr('id', 'drop-shadow')
      .attr('height', '130%');

    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result
    // in blur
    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 8)
      .attr('result', 'blur');

    // translate output of Gaussian blur to the right and downwards with 2px
    // store result in offsetBlur
    filter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 5)
      .attr('dy', 5)
      .attr('result', 'offsetBlur');

    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    const feMerge = filter.append('feMerge');

    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic')
      .attr('color', 'SourceGraphic');
  }

  renderNode (nodeSelection: d3.Selection<any, any, any, any>): void {
    nodeSelection.each(function () {
      const selection = d3.select(this);
      const datum = selection.datum();

      // Initial conditions are displayed as ellipses
      if (!(datum as any).data.role?.includes(NodeTypes.NODES.INITIAL_CONDITION)) {
        selection.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('rx', DEFAULT_STYLE.node.borderRadius)
          .attr('width', d => (d as any).width)
          .attr('height', d => (d as any).height)
          .style('fill', EpiRenderer.calcNodeColor)
          .style('stroke', DEFAULT_STYLE.node.stroke)
          .style('stroke-width', EpiRenderer.calcNodeStrokeWidth)
          .style('stroke-dasharray', EpiRenderer.calcNodeStrokeStyle)
          .style('cursor', 'pointer');
      } else {
        selection.append('ellipse')
          .attr('cx', d => (d as any).width / 2)
          .attr('cy', d => (d as any).height / 2)
          .attr('rx', d => (d as any).width / 2)
          .attr('ry', d => (d as any).height / 2)
          .style('fill', EpiRenderer.calcNodeColor)
          .style('stroke', DEFAULT_STYLE.node.stroke)
          .style('stroke-width', EpiRenderer.calcNodeStrokeWidth)
          .style('stroke-dasharray', EpiRenderer.calcNodeStrokeStyle)
          .style('cursor', 'pointer');
      }

      selection.append('text')
        .attr('x', d => (d as any).nodes ? 0 : 0.5 * (d as any).width)
        .attr('y', d => (d as any).nodes ? -5 : 25)
        .style('fill', d => calcLabelColor(d))
        .style('font-weight', d => (d as any).nodes ? '800' : '500')
        .style('text-anchor', d => (d as any).nodes ? 'left' : 'middle')
        .text(d => (d as any).data.label);

      // Special case for node parameters labels
      selection.selectAll('text')
        .filter(d => (d as any).data.role?.includes(NodeTypes.NODES.PARAMETER)).attr('y', -5);
    });
  }

  renderEdge (edgeSelection:d3.Selection<any, any, any, any>):void {
    edgeSelection.append('path')
      .classed('edge-path', true)
      .attr('d', d => pathFn(d.points))
      .style('fill', DEFAULT_STYLE.edge.fill)
      .style('stroke-width', DEFAULT_STYLE.edge.strokeWidth)
      .style('stroke', DEFAULT_STYLE.edge.stroke)
      .attr('marker-end', d => {
        const source = d.source.replace(/\s/g, '');
        const target = d.target.replace(/\s/g, '');
        return `url(#arrowhead-${source}-${target}`;
      })
      .attr('marker-start', d => {
        const source = d.source.replace(/\s/g, '');
        const target = d.target.replace(/\s/g, '');
        return `url(#start-${source}-${target}`;
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
    node.selectAll('rect, ellipse')
      .style('stroke', Colors.HIGHLIGHT)
      .style('stroke-width', DEFAULT_STYLE.node.strokeWidth + 3);
  }

  highlightNodes (nodesList: SubgraphNodeInterface[]): void {
    const chart = (this as any).chart;
    chart.selectAll('.node-ui').each(function (d) {
      const isHighlighted = nodesList.map(node => node.id).includes(d.id);
      d3.select(this).select('rect')
        .style('fill', isHighlighted ? Colors.NODES.EDITED : EpiRenderer.calcNodeColor(d));
    });
  }

  clearSelections ():void {
    const chart = (this as any).chart;
    chart.selectAll('rect')
      .style('stroke', DEFAULT_STYLE.node.stroke)
      .style('stroke-width', DEFAULT_STYLE.node.strokeWidth);
  }
}
