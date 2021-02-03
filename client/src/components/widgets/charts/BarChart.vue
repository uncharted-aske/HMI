<template>
  <div
    class="bar-chart-container"
  >
    <svg
      ref="container"
      class="chart"
    />
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';
  import * as d3 from 'd3';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import svgUtil from '@/utils/SVGUtil';

  const DEFAULT_CONFIG = {
    margin: {
      top: 25,
      right: 10,
      bottom: 30,
      left: 10,
    },
  };

  const COLORS = {
    positive: '#5E81AC',
    negative: '#BF616A',
  };

@Component
  export default class BarChart extends Vue {
    @Prop({ default: null }) data: any;
    @Prop({ default: () => [450, 500] }) size: Array<number>;

    mounted (): void {
        this.refresh();
    }

    refresh ():void {
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
            .rangeRound([0, innerWidth]);
      const yscale = d3.scaleBand()
          .rangeRound([innerHeight, 0])
          .padding(0.1);

      yscale.domain(data.map((d) => d.location));
      xscale.domain(d3.extent(data, (d) => Number((d as any).value)));

      chart.append('g')
        .attr('class', 'y-axis')
        .attr('transform', svgUtil.translate(xscale(0), 0))
        .append('line')
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke-width', '2');

      chart.append('g')
        .attr('class', 'x-axis')
        .attr('transform', svgUtil.translate(0, -margin.top))
        .call(d3.axisBottom(xscale).tickSizeOuter(0).tickFormat(d => d3.format('.2s')(d)));

      // Draw bars
      const bars = chart.append('g')
        .attr('class', 'bars');

      bars.selectAll('rect')
        .data(data)
        .enter().append('rect')
          .attr('class', '.bar')
          .attr('x', (d) => xscale(Math.min(0, d.value)))
          .attr('y', (d) => yscale(d.location))
          .attr('height', yscale.bandwidth())
          .attr('width', (d) => Math.abs(xscale(d.value) - xscale(0)))
          .style('fill', d => {
            return (d as any).value > 0 ? COLORS.positive : COLORS.negative;
          })
          .on('mouseover', function (d) {
            const coords = [xscale(0), yscale(d.location)];
            const tooltipText = 'Value: ' + d.value + ' ' + 'Date: ' + d.date;
            svgUtil.showTooltip(chart, tooltipText, coords);
          })
          .on('mouseout', () => {
            svgUtil.hideTooltip(chart);
          });

      // Draw labels
      const labels = chart.append('g')
        .attr('class', 'labels');

      labels.selectAll('text')
        .data(data)
        .enter().append('text')
        .attr('class', 'bar-label')
          .attr('x', xscale(0))
          .attr('y', (d) => yscale((d as any).location))
          .attr('dx', (d) => (d as any).value < 0 ? 10 : -10)
          .attr('dy', yscale.bandwidth())
          .attr('text-anchor', (d) => (d as any).value < 0 ? 'start' : 'end')
          .text((d) => (d as any).location)
          .style('font-size', '9px')
          .style('fill', d => {
            return (d as any).value > 0 ? COLORS.positive : COLORS.negative;
          });
    }
  }

</script>

<style lang="scss" scoped>
.bar-chart-container {
  position: relative;
  display: flex;
  padding: 5px;
  box-sizing: border-box;
  cursor: pointer;
}
</style>
