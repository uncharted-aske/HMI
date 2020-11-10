import * as d3 from 'd3';
import _ from 'lodash';

import { NODE_TYPES } from '@/graphs/svg/util.js';
import SVGRenderer from '@/graphs/svg/SVGRenderer';
import SVGUtil from '@/utils/SVGUtil.js';

const pathFn = SVGUtil.pathFn.curve(d3.curveBasis);

export default class EpiModelRenderer extends SVGRenderer {
  renderEdgeRemoved (edgeSelection) {
    edgeSelection.each(function () {
      d3.select(this).select('path').style('stroke', '#f80');
      d3.select(this)
        .transition()
        .on('end', function () {
          d3.select(this).remove();
        })
        .duration(1500)
        .style('opacity', 0.2);
    });
  }

  renderEdgeUpdated (edgeSelection) {
    edgeSelection
      .selectAll('.edge-path')
      .attr('d', d => {
        return pathFn(d.points);
      })
      .style('display', d => d.collapsed ? 'none' : ''); //HACK: Hide edges for a collapsed node
  }

  renderEdgeAdded (edgeSelection) {
    edgeSelection.append('path')
      .classed('edge-path', true)
      .attr('cursor', 'pointer')
      .attr('d', d => pathFn(d.points))
      .style('fill', 'none')
      .style('stroke', '#000')
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

  renderNodeRemoved (nodeSelection) {
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

  renderNodeUpdated (nodeSelection) {
    nodeSelection.each(function () {
      const selection = d3.select(this);
      selection.select('rect')
        .transition()
        .duration(1000)
        .attr('width', d => d.width)
        .attr('height', d => d.height);

      if (selection.datum().collapsed === true) {
        const numChildren = selection.datum().data.nodes.length;
        //Added number of children to the collapsed label
        selection.select('text')
          .style('font-weight', 'bold')
          .text(d => d.label + ' (' + numChildren + ')');
        selection.append('text')
          .classed('collapsed', true)
          .attr('x', 10)
          .attr('y', 30)
          .style('font-size', 30)
          .text('+');
      } else {
        selection.select('.collapsed').remove();
        selection.select('text') // Restore label
          .style('font-weight', 'bold')
          .text(d => d.label);
      }
    });
  }

  renderNodeAdded (nodeSelection) {
    nodeSelection.each(function () {
      const selection = d3.select(this);
      selection.selectAll('*').remove();

      if (selection.datum().id !== 'root') { // Don't draw the root node
        selection.append('rect')
          .attr('x', 0)
          .attr('rx', 5)
          .attr('y', 0)
          .attr('width', d => d.width)
          .attr('height', d => d.height)
          .style('fill', d => {
            return d.nodes ? '#F8F8F8' : '#EEE';
          })
          .style('stroke', '#888')
          .style('stroke-width', 2);
      }
      if (selection.datum().type === 'custom') {
        selection.select('rect').style('stroke-dasharray', 4).style('fill', '#CCF');
      }
    });

    nodeSelection.style('cursor', 'pointer');
    
      nodeSelection.append('text')
        .filter(d => d.nodes || d.data.nodeType !== NODE_TYPES.FUNCTION)
        .attr('x', d => d.nodes ? 0 : 0.5 * d.width)
        .attr('y', d => d.nodes ? -5 : 25)
        .style('fill', '#333')
        .style('font-weight', '600')
        .style('text-anchor', d => d.nodes ? 'left' : 'middle')
        .text(d => d.label);
  }

  renderEdge (edgeSelection) {
    edgeSelection.append('path')
      .classed('edge-path', true)
      .attr('cursor', 'pointer')
      .attr('d', d => pathFn(d.points))
      .style('fill', 'none')
      .style('stroke', '#000')
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

  hideNeighbourhood () {
    const chart = this.chart;
    chart.selectAll('.node-ui').style('opacity', 1);
    chart.selectAll('.edge').style('opacity', 1);
  }

  showNeighborhood ({ nodes, edges }) {
    const chart = this.chart;
    // FIXME: not very efficient
    const nonNeighborNodes = chart.selectAll('.node-ui').filter(d => { // Just takes into account leaf nodes
      return !d.nodes && !nodes.map(node => node.id).includes(d.id);
    });

    nonNeighborNodes.style('opacity', 0.1);

    const nonNeighborEdges = chart.selectAll('.edge').filter(d => !_.some(edges, edge => edge.source === d.data.source && edge.target === d.data.target));
    nonNeighborEdges.style('opacity', 0.1);
  }
}
