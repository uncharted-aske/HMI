import * as d3 from 'd3';
import _ from 'lodash';

import { SVGRenderer } from 'compound-graph';

import { EpiModelRendererOptionsInterface, SubgraphInterface } from '@/types/typesRenderer';

import { calcNodeColor, calcEdgeColor, calcLabelColor, flatten } from '@/graphs/svg/util';
import { Colors, NodeTypes } from '@/graphs/svg/encodings';
import SVGUtil from '@/utils/SVGUtil';

const pathFn = SVGUtil.pathFn.curve(d3.curveBasis);

export default class LocalEpiModelRenderer extends SVGRenderer {
  constructor (options:EpiModelRendererOptionsInterface) {
    super(options);
  }

  buildDefs (): void {
    const svg = d3.select(this.svgEl);
    const edges = flatten(this.layout).edges;

    // Clean up
    svg.select('defs').selectAll('.edge-marker-end').remove();

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
  }

  renderNode (nodeSelection: d3.Selection<any, any, any, any>):void {
    nodeSelection.each(function () {
      const selection = d3.select(this);

      selection.append('rect')
        .attr('x', 0)
        .attr('rx', 5)
        .attr('y', 0)
        .attr('width', d => (d as any).width)
        .attr('height', d => (d as any).height)
        .style('fill', d => calcNodeColor(d))
        .style('stroke-width', d => (d as any).nodeType === 'NOAP' ? 3 : 1)
        .style('stroke', d => (d as any).nodeType === 'NOAP' ? '#FFA500' : Colors.STROKE)
        .style('stroke-dasharray', d => {
          if ((d as any).nodeType === 'NOAP') {
            return '5,5';
          } else {
            return null;
          }
        });
    });

    nodeSelection.append('text')
      .filter(d => d.nodeType !== NodeTypes.NODES.FUNCTION)
      .attr('x', d => 0.5 * d.width)
      .attr('y', 25)
      .style('fill', d => calcLabelColor(d))
      .style('font-weight', '600')
      .style('text-anchor', 'middle')
      .text(d => {
        if (d.label.length > 10) {
          const label = d.label.slice(0, 10);
          return label.concat('...');
        } else return d.label;
      });
  }

  renderEdge (edgeSelection: d3.Selection<any, any, any, any>): void {
    edgeSelection.append('path')
      .attr('cursor', 'pointer')
      .attr('d', d => pathFn(d.points))
      .style('fill', 'none')
      .style('stroke', d => calcEdgeColor(d))
      .style('stroke-width', 5)
      .style('stroke-dasharray', d => {
        if (d.data.edgeType) {
          if (d.data.edgeType === 'NOAP') {
            return '5,5';
          }
        }
        return null;
      })
      .attr('marker-end', d => {
        const source = d.source.replace(/\s/g, '');
        const target = d.target.replace(/\s/g, '');
        return `url(#arrowhead-${source}-${target})`;
      })
      .attr('marker-start', d => {
        const source = d.source.replace(/\s/g, '');
        const target = d.target.replace(/\s/g, '');
        return `url(#start-${source}-${target})`;
      });
  }

  hideNeighbourhood (): void {
    const chart = this.chart;
    chart.selectAll('.node-ui').style('opacity', 1);
    chart.selectAll('.edge').style('opacity', 1);
  }

  showNeighborhood (subgraph: SubgraphInterface): void {
    const chart = this.chart;
    // FIXME: not very efficient
    const nodes = subgraph.nodes;
    const edges = subgraph.edges;
    const nonNeighborNodes = chart.selectAll('.node-ui').filter(d => !nodes.map(node => node.id).includes(d.id));
    nonNeighborNodes.style('opacity', 0.1);

    const nonNeighborEdges = chart.selectAll('.edge').filter(d => !_.some(edges, edge => edge.source === d.source && edge.target === d.target));
    nonNeighborEdges.style('opacity', 0.1);
  }
}
