import * as d3 from 'd3';
import _ from 'lodash';

import { SVGRenderer } from 'compound-graph';

import { EpiModelRendererOptionsInterface, SubgraphInterface } from '@/graphs/svg/types/types';

import { calcNodeColor, calcLabelColor } from '@/graphs/svg/util';
import { Colors, NodeTypes } from '@/graphs/svg/encodings';
import SVGUtil from '@/utils/SVGUtil';

const pathFn = SVGUtil.pathFn.curve(d3.curveBasis);

export default class LocalEpiModelRenderer extends SVGRenderer {
  constructor (options:EpiModelRendererOptionsInterface) {
    super(options);
  }

  renderNode(nodeSelection: d3.Selection<any, any, any, any>):void {
    nodeSelection.each(function() {
      const selection = d3.select(this);

      selection.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', d => (d as any).width)
          .attr('height', d => (d as any).height)
          .style('fill', '#DDD')
          .style('stroke', '#CCC');
      
    });
    
    nodeSelection.append('text')
      .attr('x', d =>  0.5 * d.width)
      .attr('y', 25)
      .style('fill', '#333')
      .style('font-weight', '600')
      .style('text-anchor', 'middle')
      .text(d => d.label);
  }

  renderEdge(edgeSelection: d3.Selection<any, any, any, any>): void {
    edgeSelection.append('path')
      .attr('d', d => pathFn(d.points))
      .style('fill', 'none')
      .style('stroke', '#000')
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
