import _ from 'lodash';
import * as d3 from 'd3';

import ELKBaseRenderer from '@/graphs/elk/ElkBaseRenderer.js';
import svgUtil from '@/utils/SVGUtil.js';

const pathFn = svgUtil.pathFn.curve(d3.curveBasis);

export default class EpiModelRenderer extends ELKBaseRenderer {
  renderNodes () {
    const chart = this.chart;
    chart.selectAll('.container').remove();
    chart.selectAll('.node').remove();

    const groups = chart.selectAll('.container')
      .data(this.layout.groups)
      .enter()
      .append('g')
      .classed('container', true)
      .attr('transform', d => {
        return svgUtil.translate(d.x, d.y);
      });

    groups
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .style('stroke', '#000')
      .style('fill', 'transparent');

    groups.append('text')
      .attr('x', 10)
      .attr('y', 0)
      .style('fill', '#808080')
      .style('font-weight', '600')
      .text(d => d.id);

    // Build lookup
    const groupLookup = {};
    chart.selectAll('.container').each(function (d) {
      groupLookup[d.id] = d3.select(this);
    });

    const nodes = chart.selectAll('.node')
      .data(this.layout.nodes);

    nodes.enter().each(function (nodeData) {
      const group = _.isNil(nodeData.group) ? chart : groupLookup[nodeData.group];
      const node = group.append('g')
        .datum(nodeData)
        .classed('node', true)
        .attr('transform', d => {
          return svgUtil.translate(d.x, d.y);
        });

      // Draw circles for state nodes in Petri Net representation
      node.filter(d => d.data.type === 'state')
        .append('circle')
        .attr('r', d => d.width * 0.5)
        .attr('cx', d => d.width * 0.5)
        .attr('cy', d => d.width * 0.5)
        .style('fill', '#e0ecf4')
        .style('stroke', '#888');

      // Draw rectangles for the rest of node types
      const rect = node.filter(d => d.data.type !== 'state')
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', d => d.width)
        .attr('height', d => d.height)
        .style('fill', '#e0ecf4')
        .style('stroke', '#888')
        .style('stroke-width', 1);

      // Distinguish constants from variables
      rect.filter(d => !_.isNil(d.data.type))
        .style('fill', d => {
          if (d.data.type === 'constant' || d.data.type === 'function' || d.data.type === 'transition') {
            return '#9ebcda';
          } else if (d.data.type === 'variable') {
            return '#ffffff';
          } else return '#ffffff';
        });

      node
        .filter(d => d.data.type !== 'transition' && d.data.type !== 'state')
        .append('text')
        .attr('x', 10)
        .attr('y', 20)
        .style('fill', '#333')
        .style('font-weight', '600')
        .text(d => d.data.label);

      node
        .filter(d => d.data.type === 'state')
        .append('text')
        .attr('x', d => d.width * 0.5)
        .attr('y', d => d.width * 0.5)
        .style('fill', '#333')
        .style('font-weight', '600')
        .text(d => d.data.label);
    });
  }

  renderEdges () {
    const chart = this.chart;

    // FIXME: laxy, should have a transition
    chart.selectAll('.edge').remove();

    const edges = chart.selectAll('.edge')
      .data(this.layout.edges)
      .enter()
      .append('g')
      .classed('edge', true);

    edges
      .append('path')
      .classed('edge-path', true)
      .attr('cursor', 'pointer')
      .attr('d', d => {
        return pathFn(d.points);
      })
      .style('fill', 'none')
      .style('stroke', '#6c757d')
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

    edges.filter(d => !_.isNil(d.data.metadata) && d.data.metadata.multiplicity > 1)
      .append('text')
      .attr('x', d => {
        const coords = d.sections[0];
        const sourceX = coords.startPoint.x;
        const targetX = coords.endPoint.x;
        return ((sourceX + targetX) / 2);
      })
      .attr('y', d => {
        const coords = d.sections[0];
        const sourceY = coords.startPoint.y;
        const targetY = coords.endPoint.y;
        return ((sourceY + targetY) / 2);
      })
      .attr('dy', -15)
      .style('fill', '#808080')
      .style('font-size', '14')
      .style('font-weight', '600')
      .text(d => d.data.metadata.multiplicity);

    d3.selectAll('.edge').style('opacity', 0)
      .transition()
      .duration(1600)
      .style('opacity', 1.0);
  }

  hideNeighbourhood () {
    const chart = this.chart;
    chart.selectAll('.node').style('opacity', 1);
    chart.selectAll('.edge').style('opacity', 1);
  }

  showNeighborhood ({ nodes, edges }) {
    const chart = this.chart;
    // FIXME: not very efficient
    const nonNeighborNodes = chart.selectAll('.node').filter(d => {
      return !nodes.map(node => node.id).includes(d.id);
    });
    nonNeighborNodes.style('opacity', 0.1);

    const nonNeighborEdges = chart.selectAll('.edge').filter(d => !_.some(edges, edge => edge.source === d.data.source && edge.target === d.data.target));
    nonNeighborEdges.style('opacity', 0.1);
  }
}
