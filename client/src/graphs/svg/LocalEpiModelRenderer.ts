import * as d3 from 'd3';

import { SVGRenderer } from 'compound-graph';

import { EpiModelRendererOptionsInterface } from '@/graphs/svg/types/types';

import { calcNodeColor, calcLabelColor } from '@/graphs/svg/util';
import { Colors, NodeTypes } from '@/graphs/svg/encodings';
import SVGUtil from '@/utils/SVGUtil';

const pathFn = SVGUtil.pathFn.curve(d3.curveBasis);

export default class LocalEpiModelRenderer extends SVGRenderer {
  constructor (options:EpiModelRendererOptionsInterface) {
    super(options);
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
        .style('stroke', '#888');
    });

    nodeSelection.append('text')
      .filter(d => d.nodeType !== NodeTypes.NODES.FUNCTION)
      .attr('x', d => 0.5 * d.width)
      .attr('y', 25)
      .style('fill', d => calcLabelColor(d))
      .style('font-weight', '600')
      .style('text-anchor', 'middle')
      .text(d => d.label);
  }

  renderEdge (edgeSelection: d3.Selection<any, any, any, any>): void {
    edgeSelection.append('path')
      .attr('d', d => pathFn(d.points))
      .style('fill', 'none')
      .style('stroke', Colors.EDGES)
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
}
