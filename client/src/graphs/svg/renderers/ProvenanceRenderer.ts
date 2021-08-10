import * as d3 from 'd3';

import { SVGRenderer } from 'svg-flowgraph';

import { SVGRendererOptionsInterface } from '@/types/typesGraphs';

import { flatten } from '@/graphs/svg/util';
import { Colors } from '@/graphs/svg/encodings';
import SVGUtil from '@/utils/SVGUtil';

const pathFn = SVGUtil.pathFn().curve(d3.curveBasis);

const DEFAULT_STYLE = {
  node: {
    fill: Colors.NODES.DEFAULT,
    stroke: Colors.STROKE,
    strokeWidth: 2,
    borderRadius: 5,
    controlSize: 15,
    controlColor: Colors.CONTAINER_CONTROL,
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

export default class ProvenanceRenderer extends SVGRenderer {
  constructor (options:SVGRendererOptionsInterface) {
    super(options);
  }

  static calcNodeColor (d: d3.Selection<any, any, any, any>): string {
    return (d as any).nodes ? Colors.NODES.CONTAINER : DEFAULT_STYLE.node.fill;
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

      // Operations are displayed as rectangles while data is displayed as ellipses
      if (!(datum as any).data.role?.includes('Operation')) {
        selection.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('rx', DEFAULT_STYLE.node.borderRadius)
          .attr('width', d => (d as any).width)
          .attr('height', d => (d as any).height)
          .style('fill', ProvenanceRenderer.calcNodeColor)
          .style('stroke', DEFAULT_STYLE.node.stroke)
          .style('cursor', d => (d as any).nodes ? '' : 'pointer');
      } else {
        selection.append('ellipse')
          .attr('cx', d => (d as any).width * 0.5)
          .attr('cy', d => (d as any).height * 0.5)
          .attr('rx', d => (d as any).width * 0.5)
          .attr('ry', d => (d as any).height * 0.5)
          .style('fill', ProvenanceRenderer.calcNodeColor)
          .style('stroke', DEFAULT_STYLE.node.stroke)
          .style('cursor', 'pointer');
      }

      selection.append('text')
        .attr('x', d => (d as any).nodes ? 0 : 0.5 * (d as any).width)
        .attr('y', d => (d as any).nodes ? -5 : 25)
        .style('font-weight', d => (d as any).nodes ? 'bold' : 'normal')
        .style('text-anchor', d => (d as any).nodes ? 'left' : 'middle')
        .text(d => (d as any).data.label);
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
}
