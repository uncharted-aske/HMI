import * as d3 from 'd3';

import { SVGRenderer } from 'svg-flowgraph';

import { SVGRendererOptionsInterface } from '@/types/typesGraphs';

import { calcEdgeColor, flatten } from '@/graphs/svg/util';
import { Colors } from '@/graphs/svg/encodings';
import SVGUtil from '@/utils/SVGUtil';
import { truncateString } from '@/utils/StringUtil';

const pathFn = SVGUtil.pathFn.curve(d3.curveBasis);

const DEFAULT_STYLE = {
  node: {
    fill: Colors.NODES.DEFAULT,
    stroke: Colors.STROKE,
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

export default class EpiRenderer extends SVGRenderer {
  constructor (options:SVGRendererOptionsInterface) {
    super(options);
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
      .style('fill', d => calcEdgeColor(d))
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

      if ((selection.datum() as any).nodes) {
        selection.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('rx', DEFAULT_STYLE.node.borderRadius)
          .attr('width', d => (d as any).width)
          .attr('height', d => (d as any).height)
          .style('stroke', DEFAULT_STYLE.node.stroke)
          .style('filter', 'url(#drop-shadow)');

      } else {
        selection.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('rx', DEFAULT_STYLE.node.borderRadius)
          .attr('width', d => (d as any).width)
          .attr('height', d => (d as any).height)
          .style('fill', DEFAULT_STYLE.node.fill)
          .style('stroke', DEFAULT_STYLE.node.stroke);
      }
    });
    nodeSelection.append('text')
      .attr('x', d => d.nodes ? 5 : 0.5 * d.width)
      .attr('y', d => d.nodes ? -5 : 0.5 * d.height)
      .style('fill', '#333')
      .style('font-weight', '600')
      .style('font-size', '14px')
      .style('text-anchor', d => d.nodes ? 'left' : 'middle')
      .text(d => truncateString(d.label, 15));
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
        return `url(#arrowhead-${source}-${target}`;
      })
      .attr('marker-start', d => {
        const source = d.source.replace(/\s/g, '');
        const target = d.target.replace(/\s/g, '');
        return `url(#start-${source}-${target}`;
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
