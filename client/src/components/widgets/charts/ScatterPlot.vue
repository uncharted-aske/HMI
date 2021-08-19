<template>
  <div class="scatterplot-chart-container">
    <svg ref="container" class="chart" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import _ from 'lodash';
  import * as d3 from 'd3';
  import svgUtil from '@/utils/SVGUtil';

  import * as HMI from '@/types/types';

  const DEFAULT_CONFIG = {
    margin: {
      top: 25,
      right: 10,
      bottom: 30,
      left: 100,
    },
  };

  @Component
  export default class ScatterPlot extends Vue {
    @Prop({ default: null }) data: HMI.ExtractDataParameter;
    @Prop({ default: () => [450, 400] }) size: Array<number>;

    mounted (): void {
      if (_.isEmpty(this.data)) return;
      const data = this.data;
      const svg = d3.select(this.$refs.container as any);
      svg.selectAll('*').remove();

      // Set the dimensions and margins of the chart
      const margin = DEFAULT_CONFIG.margin;
      const outerWidth = this.size[0];
      const outerHeight = this.size[1];
      const innerWidth = outerWidth - margin.left - margin.right;
      const innerHeight = outerHeight - margin.top - margin.bottom;

      const chart = svgUtil.createChart(svg, outerWidth, outerHeight)
        .append('g')
        .attr('transform', svgUtil.translate(margin.left, margin.top));

      // Define scales
      const xscale = d3.scaleLinear()
        .range([0, innerWidth]);
      const yscale = d3.scaleBand()
          .rangeRound([innerHeight, 0])
          .padding(0.1);

      xscale.domain(d3.extent(data, (d) => Number((d as any).value)));
      yscale.domain(data.map(d => d.location));

      chart.append('g')
        .attr('class', 'x-axis')
        .attr('transform', svgUtil.translate(0, innerHeight))
        .call(d3.axisBottom(xscale))
            .selectAll('text')
            .attr('transform', 'translate(-10,0)rotate(-45)')
            .style('text-anchor', 'end');

      chart.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yscale));

      chart.append('line')
        .style('stroke', 'lightgray')
        .style('stroke-dasharray', '5,5')
        .style('stroke-width', 1)
        .attr('x1', xscale(0))
        .attr('y1', 0)
        .attr('x2', xscale(0))
        .attr('y2', innerHeight);

      // Draw dots
      const dots = chart.append('g')
        .attr('class', 'dots');

      dots.selectAll('dot')
        .data(data)
        .enter()
        .append('circle')
          .attr('cx', (d) => xscale(d.value))
          .attr('cy', (d) => yscale(d.location))
          .attr('r', 5)
          .style('fill', '#5E81AC')
          .on('mouseover', (d) => {
            const coords = [xscale(d.value), yscale(d.location)];
            const tooltipText = 'Value: ' + d.value + ' ' + 'Date: ' + d.date;
            /* @ts-ignore */
            svgUtil.showTooltip(chart, tooltipText, coords);
          })
          .on('mouseout', () => {
            svgUtil.hideTooltip(chart);
          })
          .on('click', (d) => {
            this.$emit('dot-click', d.object_id);
          });
    }
  }
</script>

<style scoped>
  .scatterplot-chart-container {
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    padding: 5px;
    position: relative;
  }

  .chart {
    height: auto;
  }
</style>
