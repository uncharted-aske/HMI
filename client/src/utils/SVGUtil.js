import * as d3 from 'd3';

/* SVG Utility functions */

/**
 * Chart wrapper
 * @param {object} svg - D3 svg selection
 * @param {number} w - width
 * @param {number} h - height
 * @param {object} viewport - optional x1, y1, x2, y2.
 */
export const createChart = (svg, w, h, viewport = {}) => {
  svg.attr('width', w + 'px');
  svg.attr('height', h + 'px');

  const x1 = viewport.x1 || 0;
  const y1 = viewport.y1 || 0;
  const x2 = viewport.x2 || w;
  const y2 = viewport.y2 || h;

  svg.attr('preserveAspectRatio', 'xMinYMin meet');
  svg.attr('viewBox', `${x1} ${y1} ${x2} ${y2}`);
  svg.append('defs');

  return svg;
};

export const translate = (x, y) => { return `translate(${x}, ${y})`; };

// A path generator
export const pathFn = d3.line()
  .x(d => d.x)
  .y(d => d.y);

export const hierarchyFn = d3.stratify()
  .id((d) => d.id)
  .parentId((d) => d.parent);

export const hideTooltip = (domlocation) => {
  domlocation.selectAll('.svg-tooltip').remove();
};

export const showTooltip = (domlocation, text, position) => {
  hideTooltip(domlocation);

  const svgTooltip = domlocation.append('g')
    .classed('svg-tooltip', true)
    .attr('transform', translate(position[0], position[1]));

  const svgTooltipRect = svgTooltip
    .append('rect')
    .attr('y', 15)
    .style('rx', '4px')
    .style('opacity', '0.8')
    .style('background-color', 'black');

  svgTooltip
    .append('polygon')
    .attr('points', '0,10 -5,15 5,15')
    .style('opacity', '0.8')
    .style('background-color', 'black');

  const svgTooltipText = svgTooltip
    .append('text')
    .attr('y', 30)
    .style('font-weight', 600)
    .style('font-size', '10px')
    .style('fill', 'white')
    .text(text);

  const svgTooltipTextHeight = 20;
  const svgTooltipTextWidth = svgTooltipText.node().getComputedTextLength();

  svgTooltipText.attr('x', -svgTooltipTextWidth / 2);

  svgTooltipRect
    .attr('x', -svgTooltipTextWidth / 1.7)
    .attr('width', svgTooltipTextWidth * 1.2)
    .attr('height', svgTooltipTextHeight * 1.2);
};

// Pre-canned path/glyphs, we assume all paths are bounded by a 10x10 grid and centered at (0, 0)
// - Arrows point left-to-right
export const MARKER_VIEWBOX = '-5 -5 10 10';
export const ARROW = 'M 0,-3.25 L 5 ,0 L 0,3.25';
export const ARROW_SHARP = 'M 0,-3 L 5 ,0 L 0,3 L 1 0';

export default {
  createChart,
  translate,
  pathFn,
  hierarchyFn,

  hideTooltip,
  showTooltip,

  MARKER_VIEWBOX,
  ARROW,
  ARROW_SHARP,
};
