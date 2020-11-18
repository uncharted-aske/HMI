import * as d3 from 'd3';
import _ from 'lodash';

import { SVGRenderer } from 'compound-graph';

import { EpiModelRendererOptionsInterface, SubgraphInterface } from '@/graphs/svg/types/types';

import { calcNodeColor, NODE_TYPES, VARIABLE_TYPES } from '@/graphs/svg/util.js';
import { Colors } from '@/graphs/svg/encodings.ts';
import SVGUtil from '@/utils/SVGUtil.js';

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
      })
      .style('opacity', d => (d as any).collapsed ? 0 : 1); // FIXME: This is a hack and edges are still clickable
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
          .filter(d => (d as any).data.nodeType !== NODE_TYPES.FUNCTION)
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
            // Emphasize model code
            if (role && role === 'model') {
              return 6;
            } else return 1;
          });

        // Special encodings for initial condition nodes
        if ((selection.datum() as any).data.nodeType === NODE_TYPES.VARIABLE) {
          const d = selection.datum();
          if ((d as any).data.varType) {
            const type = (d as any).data.varType;
            if (type === VARIABLE_TYPES.INITIAL_CONDITION) {
              selection.select('rect').style('stroke-dasharray', 4);
            }
          }
        }
      }
      if ((selection.datum() as any).type === 'custom') {
        selection.select('rect').style('stroke-dasharray', 4).style('fill', '#CCF');
      }
    });

    nodeSelection.style('cursor', 'pointer');

    // Add label for all nodes but FUNCTIONS
    nodeSelection.append('text')
      .filter(d => d.data.nodeType !== NODE_TYPES.FUNCTION)
      .attr('x', d => d.nodes ? 0 : 0.5 * d.width)
      .attr('y', d => d.nodes ? -5 : 25)
      .style('fill', '#333')
      .style('font-weight', '600')
      .style('text-anchor', d => d.nodes ? 'left' : 'middle')
      .text(d => d.data.label);
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
    const nonNeighborNodes = chart.selectAll('.node-ui').filter(d => {
      return !nodes.map(node => node.id).includes(d.id);
    });

    nonNeighborNodes.style('opacity', 0.1);

    const nonNeighborEdges = chart.selectAll('.edge').filter(d => !_.some(edges, edge => edge.source === d.data.source && edge.target === d.data.target));
    nonNeighborEdges.style('opacity', 0.1);
  }
}
