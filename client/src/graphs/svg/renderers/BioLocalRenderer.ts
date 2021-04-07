import * as d3 from 'd3';
import _ from 'lodash';

import { SVGRenderer } from 'svg-flowgraph';

import { SVGRendererOptionsInterface, SubgraphInterface } from '@/types/typesGraphs';

import { calcEdgeColor, calcEdgeControlBackground, flatten } from '@/graphs/svg/util';
import { Colors, EdgeTypes } from '@/graphs/svg/encodings';
import SVGUtil from '@/utils/SVGUtil';
import { truncateString } from '@/utils/StringUtil';

const pathFn = SVGUtil.pathFn.curve(d3.curveBasis);

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
    controlStrokeWidth: 1,
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

      selection.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('rx', DEFAULT_STYLE.node.borderRadius)
        .attr('width', d => (d as any).width)
        .attr('height', d => (d as any).height)
        .style('fill', d => (d as any).nodes ? '' : DEFAULT_STYLE.node.fill)
        .style('stroke', DEFAULT_STYLE.node.stroke)
        .style('stroke-width', d => (d as any).nodes ? 5 : DEFAULT_STYLE.node.strokeWidth);

      selection
        .filter(d => (d as any).height > 20) // Don't show labels for small nodes
        .append('text')
        .attr('x', d => (d as any).nodes ? 0 : 0.5 * (d as any).width)
        .style('font-weight', d => (d as any).nodes ? '800' : '500')
        .style('text-anchor', d => (d as any).nodes ? 'left' : 'middle')
        .text(d => truncateString((d as any).label, 10))
        .style('font-size', '1px')
        .each(function (d) {
          // Set the text size based on the size of the container
          const bbox = this.getBBox();
          const containerBbox = (this.parentNode as any).getBBox();
          const scale = Math.min(containerBbox.width / bbox.width, containerBbox.height / bbox.height);
          (d as any).scale = scale;
          return d;
        }).style('font-size', (d) => (d as any).scale + 'px')
        .attr('y', d => (d as any).nodes ? -5 : (0.5 * (d as any).height + 0.5 * (d as any).scale));
    });
  }

  renderEdgeControl (edgeSelection:d3.Selection<any, any, any, any>):void {
    // FIXME: move this to the SVGUtil
    const arcGenerator = d3.arc()
      .outerRadius(DEFAULT_STYLE.edge.controlRadius - DEFAULT_STYLE.edge.controlStrokeWidth)
      .innerRadius(0)
      .startAngle(0 * (Math.PI / 180)) // Degrees to radians
      .endAngle(180 * (Math.PI / 180));

    edgeSelection.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', DEFAULT_STYLE.edge.controlRadius)
      .attr('fill', d => calcEdgeControlBackground(d))
      .attr('stroke', 'white')
      .attr('stroke-width', DEFAULT_STYLE.edge.controlStrokeWidth);

    // Semi-circle just added for partially curated statements
    edgeSelection
      .filter(d => d.data.curated === EdgeTypes.CURATION_STATUS.PARTIAL)
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', Colors.CURATION.CORRECT);
  }

  renderEdge (edgeSelection:d3.Selection<any, any, any, any>):void {
    edgeSelection.append('path')
      .classed('edge-path', true)
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

  hideNeighborhood (): void {
    const chart = (this as any).chart;
    chart.selectAll('.highlight-path').remove();
    chart.selectAll('.node-ui').select('rect').style('stroke', DEFAULT_STYLE.node.stroke).style('stroke-width', DEFAULT_STYLE.node.strokeWidth);
  }

  showNeighborhood (subgraph: SubgraphInterface): void {
    const chart = (this as any).chart;
    // FIXME: not very efficient
    const nodes = subgraph.nodes;
    const edges = subgraph.edges;

    const neighborNodes = chart.selectAll('.node-ui').filter(d => nodes.map(node => node).includes(d.id));
    neighborNodes.select('rect').style('stroke', Colors.HIGHLIGHT).style('stroke-width', DEFAULT_STYLE.node.strokeWidth * 2.5);

    const neighborEdges = chart.selectAll('.edge').filter(d => _.some(edges, edge => edge.source === d.source && edge.target === d.target));
    const highlightedEdges = neighborEdges.append('path')
      .classed('highlight-path', true)
      .attr('d', d => pathFn(d.points))
      .style('fill', DEFAULT_STYLE.edge.fill)
      .style('stroke', Colors.HIGHLIGHT)
      .style('stroke-width', DEFAULT_STYLE.edge.strokeWidth * 2);

    highlightedEdges.lower(); // Display highlighted edges at the bottom of the edge group
  }
}
