import * as d3 from 'd3';
import _ from 'lodash';

import { SVGRenderer } from 'compound-graph';

import { EpiModelRendererOptionsInterface, SubgraphInterface } from '@/graphs/svg/types/types';

import { calcNodeColor } from '@/graphs/svg/util';
import { Colors, NodeTypes } from '@/graphs/svg/encodings';
import SVGUtil from '@/utils/SVGUtil';

const pathFn = SVGUtil.pathFn.curve(d3.curveBasis);

export default class EPIModelRenderer extends SVGRenderer {
  constructor (options:EpiModelRendererOptionsInterface) {
    super(options);
  }

  renderEdgeRemoved (edgeSelection: d3.Selection<any, any, any, any>): void {
    edgeSelection.each(function () {
      d3.select(this)
        .transition()
        .on('end', function () {
          d3.select(this).remove();
        })
        .duration(1500)
        .style('opacity', 0.2);
    });
  }

  renderEdgeUpdated (edgeSelection: d3.Selection<any, any, any, any>): void {
    edgeSelection
      .selectAll('.edge-path')
      .attr('d', d => {
        return pathFn((d as any).points);
      });
  }

  renderEdgeAdded (edgeSelection: d3.Selection<any, any, any, any>): void {
    edgeSelection.append('path')
      .classed('edge-path', true)
      .attr('cursor', 'pointer')
      .attr('d', d => pathFn(d.points))
      .style('fill', 'none')
      .style('stroke', Colors.EDGES)
      .style('stroke-width', 2)
      .attr('marker-end', d => {
        const source = d.data.source.replace(/\s/g, '');
        const target = d.data.target.replace(/\s/g, '');
        return `url(#arrowhead-${source}-${target})`;
      })
      .attr('marker-start', d => {
        const source = d.data.source.replace(/\s/g, '');
        const target = d.data.target.replace(/\s/g, '');
        return `url(#start-${source}-${target})`;
      });
  }

  renderNodeRemoved (nodeSelection: d3.Selection<any, any, any, any>): void {
    nodeSelection.each(function () {
      d3.select(this)
        .transition()
        .on('end', function () {
          d3.select(this.parentNode).remove();
        })
        .duration(1500)
        .style('opacity', 0.2);
    });
  }

  renderNodeUpdated (nodeSelection: d3.Selection<any, any, any, any>): void {
    nodeSelection.each(function () {
      const selection = d3.select(this);
      selection.select('rect')
        .transition()
        .duration(1000)
        .attr('width', d => (d as any).width)
        .attr('height', d => (d as any).height)
        .style('fill', d => calcNodeColor(d));

      if ((selection.datum() as any).collapsed === true) {
        const numChildren = (selection.datum() as any).data.nodes.length;
        // Added number of children to the collapsed label
        selection.select('text')
          .style('font-weight', 'bold')
          .text(d => (d as any).label + ' (' + numChildren + ')');
        selection.append('text')
          .classed('collapsed', true)
          .attr('x', 10)
          .attr('y', 30)
          .style('font-size', 30)
          .text('+');
      } else {
        selection.select('.collapsed').remove();
        selection.select('text') // Restore label
          .filter(d => (d as any).nodeType !== NodeTypes.NODES.FUNCTION)
          .style('font-weight', 'bold')
          .text(d => (d as any).label);
      }
    });
  }

  renderNodeAdded (nodeSelection: d3.Selection<any, any, any, any>): void {
    nodeSelection.each(function () {
      const selection = d3.select(this);
      selection.selectAll('*').remove();

      if ((selection.datum() as any).id !== 'root') { // Don't draw the root node
        selection.append('rect')
          .attr('x', 0)
          .attr('rx', 5)
          .attr('y', 0)
          .attr('width', d => (d as any).width)
          .attr('height', d => (d as any).height)
          .style('fill', d => calcNodeColor(d))
          .style('stroke', '#888')
          .style('stroke-width', d => {
            const role = (d as any).data.role;
            return role === 'model' ? 6 : 1;
          });

        // Special encodings for initial condition nodes
        if ((selection.datum() as any).nodeType === NodeTypes.NODES.VARIABLE) {
          const d = selection.datum();
          if ((d as any).nodeSubType === NodeTypes.VARIABLES.INITIAL_CONDITION) {
            selection.select('rect').style('stroke-dasharray', 4);
          }
        }
      }
    });

    nodeSelection.style('cursor', 'pointer');

    // Add label for all nodes but FUNCTIONS
    nodeSelection.append('text')
      .filter(d => d.nodeType !== NodeTypes.NODES.FUNCTION)
      .attr('x', d => d.nodes ? 0 : 0.5 * d.width)
      .attr('y', d => d.nodes ? -5 : 25)
      .style('fill', '#333')
      .style('font-weight', '600')
      .style('text-anchor', d => d.nodes ? 'left' : 'middle')
      .text(d => d.label);
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

  highlight (subgraph: SubgraphInterface): void {
    const svg = d3.select(this.svgEl);
    const chart = this.chart;

    const color = 'orange';

    const highlightId = `glow${(new Date()).getTime()}`;

    // Add temporary filter definition
    const filter = svg.select('defs')
      .append('filter')
      .attr('id', highlightId)
      .attr('width', '200%')
      .attr('filterUnits', 'userSpaceOnUse');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', 4.5)
      .attr('result', 'blur');

    filter.append('feOffset')
      .attr('in', 'blur')
      .attr('result', 'offsetBlur')
      .attr('dx', 0)
      .attr('dy', 0)
      .attr('x', -10)
      .attr('y', -10);

    filter.append('feFlood')
      .attr('in', 'offsetBlur')
      .attr('flood-color', color)
      .attr('flood-opacity', 0.95)
      .attr('result', 'offsetColor');

    filter.append('feComposite')
      .attr('in', 'offsetColor')
      .attr('in2', 'offsetBlur')
      .attr('operator', 'in')
      .attr('result', 'offsetBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur');

    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    // Apply filter
    // FIXME: not very efficient
    const hEdges = chart.selectAll('.edge').filter(d => {
      return _.some(subgraph.edges, edge => edge.source === d.source && edge.target === d.target);
    });
    hEdges.style('filter', `url(#${highlightId})`).classed(`${highlightId}`, true);

    // const hNodes = chart.selectAll('.node-ui').filter(d => { console.log(d); return subgraph.nodes.includes(d.id); });
    // hNodes.style('filter', `url(#${highlightId})`).classed(`${highlightId}`, true);
  }
}
