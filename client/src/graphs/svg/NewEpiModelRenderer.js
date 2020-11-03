import * as d3 from 'd3';

import SVGRenderer from '@/graphs/svg/SVGRenderer';
import SVGUtil from '@/utils/SVGUtil.js';

const pathFn = SVGUtil.pathFn.curve(d3.curveBasis);


export default class NewEpiModelRenderer extends SVGRenderer {
    //Basic
    renderNode(nodeSelection) {
      nodeSelection.each(function() {
        const selection = d3.select(this);
        if (selection.datum().nodes) {
          selection.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .style('fill', d => {
              if (d.collapsed === true) return '#f80';
              return d.nodes ? '#F8F8F8' : '#FE0';
            })
            .style('stroke', '#888')
            .style('stroke-width', 2);
        } else {
          selection.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .style('fill', '#DDD')
            .style('stroke', '#888')
            .style('stroke-width', 1);
        }
      });
      nodeSelection.append('text')
        .attr('x', d => d.nodes ? 0 : 0.5 * d.width)
        .attr('y', d => d.nodes ? -5 : 25)
        .style('fill', '#333')
        .style('font-weight', '600')
        .style('text-anchor', d => d.nodes ? 'left' : 'middle')
        .text(d => d.data.label);
    }
  
  
    renderEdge(edgeSelection) {
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
  }