import * as d3 from 'd3';
import _ from 'lodash';

import { SVGRenderer } from 'compound-graph';

import { EpiModelRendererOptionsInterface, SubgraphInterface } from '@/graphs/svg/types/types';

import { calcNodeColor, calcLabelColor, flatten } from '@/graphs/svg/util';
import { Colors, NodeTypes } from '@/graphs/svg/encodings';
import SVGUtil from '@/utils/SVGUtil';

const pathFn = SVGUtil.pathFn.curve(d3.curveBasis);

export default class GlobalEPIModelRenderer extends SVGRenderer {
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
      .style('fill', Colors.EDGES)
      .style('stroke', 'none');

    // Vreate filter with id #drop-shadow
    // height=130% so that the shadow is not clipped
    const filter = svg.select('defs').append('filter')
      .attr('id', 'drop-shadow')
      .attr('height', '130%');

    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result
    // in blur
    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 10)
      .attr('result', 'blur');

    // translate output of Gaussian blur to the right and downwards with 2px
    // store result in offsetBlur
    filter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 5)
      .attr('dy', 5)
      .attr('result', 'offsetBlur');

    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    const feMerge = filter.append('feMerge');

    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic')
      .attr('color', 'SourceGraphic');
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
        .filter(d => {
          return (!(d as any).nodeSubType ||
          ((d as any).nodeSubType && (!(d as any).nodeSubType.includes('input') && !(d as any).nodeSubType.includes('output'))));
        })
        .transition()
        .duration(1000)
        .attr('width', d => (d as any).width)
        .attr('height', d => (d as any).height)
        .style('fill', d => calcNodeColor(d));

      if ((selection.datum() as any).collapsed === true) {
        // TODO: Investigate ways to add number of children to the collapsed label.
        // When the node is collapsed, there is no access to the children nodes at the moment.
        selection.select('text')
          .style('font-weight', 'bold')
          .text(d => (d as any).label);
        selection.append('text')
          .classed('collapsed', true)
          .style('fill', Colors.LABELS.LIGHT)
          .attr('x', 10)
          .attr('y', 30)
          .style('font-size', 30)
          .text('+');
      } else {
        selection.select('.collapsed').remove();
        selection.select('text') // Restore label
          .filter(d => (d as any).nodeType !== NodeTypes.NODES.FUNCTION)
          .style('fill', d => calcLabelColor(d))
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
          .attr('fill-opacity', d => {
            if ((d as any).nodes) {
              return ((d as any).depth) * 0.3;
            } else return 1;
          })
          .style('stroke', d => {
            const role = (d as any).role;
            return role === 'model' ? Colors.HIGHLIGHT : Colors.STROKE;
          })
          .style('stroke-width', d => {
            const role = (d as any).role;
            return role === 'model' ? 5 : 3;
          })
          .style('filter', d => (d as any).nodes ? 'url(#drop-shadow)' : '');

        // Labels
        selection.append('text')
          .filter(d => (d as any).nodeType !== NodeTypes.NODES.FUNCTION)
          .attr('x', d => (d as any).nodes ? 5 : 0.5 * (d as any).width)
          .attr('y', d => (d as any).nodes ? (-0.5 * 25) : 25)
          .style('fill', d => calcLabelColor(d))
          .style('font-weight', d => (d as any).nodes ? '800' : '500')
          .style('text-anchor', d => (d as any).nodes ? 'left' : 'middle')
          .text(d => (d as any).label)
          .each(function (d) {
            (d as any).textWidth = this.getBBox().width + 10; // Property to be able to adjust the rect to the label size
          });

        selection.append('rect')
          .filter(d => (d as any).nodeType !== NodeTypes.NODES.FUNCTION && (d as any).nodes)
          .attr('x', -5)
          .attr('y', -25)
          .attr('rx', 5)
          .attr('width', d => (d as any).textWidth)
          .attr('height', 25)
          .style('fill', Colors.LABELS.BACKGROUND)
          .style('stroke', Colors.LABELS.STROKE);

        selection.append('text')
          .filter(d => (d as any).nodeType !== NodeTypes.NODES.FUNCTION)
          .attr('x', d => (d as any).nodes ? 0 : 0.5 * (d as any).width)
          .attr('y', d => (d as any).nodes ? -5 : 25)
          .style('fill', d => calcLabelColor(d))
          .style('font-weight', d => (d as any).nodes ? '800' : '500')
          .style('text-anchor', d => (d as any).nodes ? 'left' : 'middle')
          .text(d => (d as any).label);

        selection.style('cursor', 'pointer');
      }
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

  highlightSubgraph (subgraph: SubgraphInterface, color: string): void {
    const chart = this.chart;
    const hEdges = chart.selectAll('.edge-path').filter(d => {
      return _.some(subgraph.edges, edge => edge.source === d.source || edge.target === d.target);
    });
    const hNodes = chart.selectAll('.node-ui ellipse, rect').filter(d => {
      return subgraph.nodes.map(node => node.id).includes(d.id);
    });

    hEdges.style('stroke', color);
    hEdges.style('stroke-width', 3);

    hNodes.style('stroke', color);
    hNodes.style('stroke-width', 3);
  }

  highlightReference (referenceId: string, color: string): void {
    const svg = d3.select(this.svgEl);
    const chart = this.chart;

    const highlightId = `glow${referenceId}`;

    // Add temporary filter definition
    const filter = svg.select('defs')
      .append('filter')
      .attr('id', highlightId)
      .attr('width', '200%')
      .attr('filterUnits', 'userSpaceOnUse');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', 8)
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
      .attr('flood-opacity', 1)
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

    const hNode = chart.selectAll('.node-ui ellipse, rect').filter(d => {
      return d.id === referenceId;
    });

    hNode.style('filter', `url(#${highlightId})`).classed(`${highlightId}`, true);
  }

  unHighlightReference (referenceId: string):void {
    const highlightId = `glow${referenceId}`;
    d3.select(`#${highlightId}`).remove();
    d3.selectAll(`.${highlightId}`).style('filter', null);
  }
}
