import _ from 'lodash'
import * as d3 from 'd3'

import ELKBaseRenderer from '@/graphs/elk/elk-base-renderer'
import svgUtil from '@/utils/svg-util'

const pathFn = svgUtil.pathFn.curve(d3.curveBasis)

export default class ModelRenderer extends ELKBaseRenderer {
  renderNodes () {
    const chart = this.chart
    chart.selectAll('.container').remove()
    chart.selectAll('.node').remove()

    const groups = chart.selectAll('.container')
      .data(this.layout.groups)
      .enter()
      .append('g')
      .classed('container', true)
      .attr('transform', d => {
        return svgUtil.translate(d.x, d.y)
      })

    groups
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .style('stroke', '#000')
      .style('fill', 'transparent')

    groups.append('text')
      .attr('x', 10)
      .attr('y', 0)
      .style('fill', '#808080')
      .style('font-weight', '600')
      .text(d => d.id)

    // Build lookup
    const groupLookup = {}
    chart.selectAll('.container').each(function (d) {
      groupLookup[d.id] = d3.select(this)
    })

    const nodes = chart.selectAll('.node')
      .data(this.layout.nodes)

    nodes.enter().each(function (nodeData) {
      const group = _.isNil(nodeData.group) ? chart : groupLookup[nodeData.group]
      const node = group.append('g')
        .datum(nodeData)
        .classed('node', true)
        .attr('transform', d => {
          return svgUtil.translate(d.x, d.y)
        })

      const rect = node
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', d => d.width)
        .attr('height', d => d.height)
        .style('fill', '#e0ecf4')
        .style('stroke', '#888')
        .style('stroke-width', 2)

      // Distinguish constants from variables
      rect.filter(d => !_.isNil(d.data.type))
        .style('fill', d => d.data.type === 'constant' ? '#9ebcda' : '#e0ecf4')

      node.append('text')
        .attr('x', 10)
        .attr('y', 20)
        .style('fill', '#333')
        .style('font-weight', '600')
        .text(d => d.data.label)
    })
  }

  renderEdges () {
    const chart = this.chart

    // FIXME: laxy, should have a transition
    chart.selectAll('.edge').remove()

    const edges = chart.selectAll('.edge')
      .data(this.layout.edges)
      .enter()
      .append('g')
      .classed('edge', true)

    edges
      .append('path')
      .classed('edge-path', true)
      .attr('cursor', 'pointer')
      .attr('d', d => pathFn(d.points))
      .style('fill', 'none')
      .style('stroke', 'black')
      .style('stroke-width', 2)
      .attr('marker-end', d => {
        const source = d.data.source.replace(/\s/g, '')
        const target = d.data.target.replace(/\s/g, '')
        return `url(#arrowhead-${source}-${target})`
      })
      .attr('marker-start', d => {
        const source = d.data.source.replace(/\s/g, '')
        const target = d.data.target.replace(/\s/g, '')
        return `url(#start-${source}-${target})`
      })

    d3.selectAll('.edge').style('opacity', 0)
      .transition()
      .duration(1600)
      .style('opacity', 1.0)
  }
}
