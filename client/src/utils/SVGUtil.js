import _ from 'lodash';
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

  // Re-arrange data into a hierarchy. This returns data in the following format:
  // https://github.com/d3/d3-hierarchy#stratify
export const hierarchyFn = d3.stratify()
  .id((d) => d.id)
  .parentId((d) => d.parent);

export const hideTooltip = (svgContainer) => {
  if (svgContainer === null || svgContainer.node() === null) return;
  svgContainer.selectAll('.svg-tooltip').remove();
};

/** Borrowed from Causemos (WM)
 * Appends a nice tooltip to the svg at the position requested
 * @param {Object} svgContainer - the svg element where the tooltip is removed/appended
 * @param {String} text - the text inside the tooltip - can include \n, will word wrap
 * @param {Object} position - [x,y] array, svg coordinates where the tooltip will point at
 * @param {Number} preferredAngle - radians direction the tooltip will point (default -PI/2 = pointing down, tooltip above), can be adjusted if the tooltip doesn't fit
 * @param {Bool} flexPosition - allow the tooltip to adjust it's position based on if it fits within the bbox of it's container element
 */
export const showTooltip = (svgContainer, text, position, preferredAngle, flexPosition) => {
  if (svgContainer === null || svgContainer.node() === null) { console.log('svgContainer is null\n'); return; }

  let angle = (_.isNumber(preferredAngle)) ? preferredAngle : -Math.PI / 2; // points down (tooltip above)

  hideTooltip(svgContainer);

  const originalBBox = svgContainer.node().getBBox();

  const padding = 10;
  const lineSpacing = 12;

  const svgTooltip = svgContainer.append('g')
    .classed('svg-tooltip', true)
    .attr('transform', translate(...position))
    .style('pointer-events', 'none')
    .style('opacity', '1');

  // add arrow first so that it's behind background-rect and text
  const svgTooltipArrow = svgTooltip
    .append('polygon')
    .attr('points', [
      [padding, 0],
      [padding * 2, -padding * 0.5],
      [padding * 2, padding * 0.5],
    ].join(' '))
    .style('fill', '#4c566a');

  const svgTooltipContents = svgTooltip
    .append('g');

  const svgTooltipRect = svgTooltipContents
    .append('rect')
    .style('rx', '4px')
    .style('fill', '#4c566a');

  const svgTooltipText = svgTooltipContents
    .append('text')
    .style('font-weight', 600)
    .style('font-size', '10px')
    .style('fill', 'white');

  const tspans = String(text).replace(/<br \/>/g, '\n').split('\n')
    .map(line => svgTooltipText.append('tspan').text(line).node());

  const svgTooltipTextWidth = Math.round(Math.max(...tspans.map(tspan => tspan.getComputedTextLength())) + padding * 2);
  const svgTooltipTextHeight = lineSpacing * tspans.length + padding * 2;

  tspans.forEach((tspan, i) => {
    d3.select(tspan)
      .attr('x', (svgTooltipTextWidth - tspan.getComputedTextLength()) / 2)
      .attr('y', i * lineSpacing + padding * 2);
  });

  svgTooltipRect
    .attr('width', svgTooltipTextWidth)
    .attr('height', svgTooltipTextHeight);

  const offset = [
    (Math.cos(angle) * (svgTooltipTextWidth * 0.5 + padding * 1.75)),
    (Math.sin(angle) * (svgTooltipTextHeight * 0.5 + padding * 1.75)),
  ];

  // move tooltip into place and see if it affects the bbox of the container
  svgTooltipContents.attr('transform', translate(offset[0] + (svgTooltipTextWidth * -0.5), offset[1] + (svgTooltipTextHeight * -0.5)));

  // if adding this tooltip changed the BBox, move the tooltip to adjust accordingly
  if (flexPosition === true) {
    const newBBox = svgContainer.node().getBBox();

    if (newBBox.x < originalBBox.x) {
      offset[0] += (originalBBox.x - newBBox.x);
    } else if (newBBox.width > originalBBox.width) {
      offset[0] -= svgTooltipTextWidth + padding * 3.5;
    }

    if (newBBox.y < originalBBox.y) {
      offset[1] += (originalBBox.y - newBBox.y);
    } else if (newBBox.height > originalBBox.height) {
      offset[1] -= (newBBox.height - originalBBox.height);
    }
  }

  // re-angle that angle (the arrow)
  angle = Math.atan2(offset[1], offset[0]);

  svgTooltipContents.attr('transform', translate(offset[0] + (svgTooltipTextWidth * -0.5), offset[1] + (svgTooltipTextHeight * -0.5)));
  svgTooltipArrow.attr('transform', 'rotate(' + (angle / Math.PI * 180) + ')');
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
