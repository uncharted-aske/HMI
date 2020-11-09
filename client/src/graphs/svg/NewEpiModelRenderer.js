import * as d3 from 'd3';

import SVGRenderer from '@/graphs/svg/SVGRenderer';
import SVGUtil from '@/utils/SVGUtil.js';

const pathFn = SVGUtil.pathFn.curve(d3.curveBasis);

export default class NewEpiModelRenderer extends SVGRenderer {
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
      });
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
        selection.append('text')
          .classed('collapsed', true)
          .attr('x', 13)
          .attr('y', 30)
          .style('font-size', 30)
          .text('+');
      } else {
        selection.select('.collapsed').remove();
      }
    });
  }

  renderNodeAdded (nodeSelection) {
    nodeSelection.each(function () {
      const selection = d3.select(this);
      selection.selectAll('*').remove();

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

      if (selection.datum().type === 'custom') {
        selection.select('rect').style('stroke-dasharray', 4).style('fill', '#CCF');
      }
    });

    nodeSelection.style('cursor', 'pointer');

    nodeSelection.append('text')
      .attr('x', d => d.nodes ? 0 : 0.5 * d.width)
      .attr('y', d => d.nodes ? -5 : 25)
      .style('fill', '#333')
      .style('font-weight', '600')
      .style('text-anchor', d => d.nodes ? 'left' : 'middle')
      .text(d => d.data.label);
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
}
