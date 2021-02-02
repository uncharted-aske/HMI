<template>
  <div
    class="line-chart-container"
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
  import moment from 'moment';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import svgUtil from '@/utils/SVGUtil';

  const DEFAULT_CONFIG = {
    margin: {
      top: 20,
      right: 10,
      bottom: 30,
      left: 10,
    },
  };
// const BAND_WIDTH = 30;

// const RIGHT_ARROW_EVENT_CODE = 39;
// const LEFT_ARROW_EVENT_CODE = 37;

// const MARKER_RADIUS = 2.5;
/**
 * Histogram chart
 *
 * data example
 * [
 *  {
 *    name: 'series1', // optional
 *    color: 'red', // optional
 *    series: [
 *      { timestamp: 18234298402, value: 333}
 *      ...
 *    ]
 *  },
 *  {
 *    name: 'series2',
 *    color: 'blue',
 *    series: [
 *     { timestamp: 18234298404, value: 200}
 *     { timestamp: 18234298405, value: 110}
 *      ...
 *    ]
 *  }
 * ]
 */
@Component
  export default class BarChart extends Vue {
    @Prop({ default: null }) data: any;
    @Prop({ default: () => [450, 600] }) size: Array<number>;

    mounted (): void {
        this.refresh();
    }

    refresh ():void {
      if (_.isEmpty(this.data)) return;
      const svg = d3.select(this.$refs.container as any);

      // Set the dimensions and margins of the chart
      const margin = DEFAULT_CONFIG.margin;
      const outerWidth = this.size[0];
      const outerHeight = this.size[1];
      const innerWidth = outerWidth - margin.left - margin.right;
      const innerHeight = outerHeight - margin.top - margin.bottom;

      svg.selectAll('*').remove();
      const chart = svgUtil.createChart(svg, outerWidth, outerHeight)
        .append('g')
        .attr('transform', svgUtil.translate(margin.left, margin.top));

      const data = this.data;

      const xscale = d3.scaleLinear()
            .rangeRound([0, innerWidth]);
            
      const yscale = d3.scaleBand()
          .rangeRound([innerHeight, 0])
          .padding(0.1);

      yscale.domain(data.map(function(d) { return d.location; }));
      xscale.domain(d3.extent(data, function(d) { return Number((d as any).value); }));

      let yAxis = chart.append("g")
      	.attr("class", "y-axis")
      	.attr("transform", svgUtil.translate(xscale(0), 0))
      	.append("line")
          .attr("y1", 0)
          .attr("y2", innerHeight);

       let xAxis = chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", svgUtil.translate(0, innerHeight + margin.bottom ))
        .call(d3.axisBottom(xscale).tickSizeOuter(0));
        

      let bars = chart.append("g")
      	.attr("class", "bars")
      
      bars.selectAll("rect")
      	.data(data)
      .enter().append("rect")
      	.attr("class", ".bar")
      	.attr("x", function(d) {
       		return xscale(Math.min(0, d.value));
      	})
      	.attr("y", function(d) { return yscale(d.location); })
      	.attr("height", yscale.bandwidth())
      	.attr("width", function(d) { 
        	return Math.abs(xscale(d.value) - xscale(0))
      	})
        .style("fill", d => {
          return (d as any).value > 0 ? "#5E81AC" : "#BF616A";
        })
        .style("stroke", '#ECEFF4');
        
        

      let labels = svg.append("g")
      	.attr("class", "labels");
      
      labels.selectAll("text")
      	.data(data)
      .enter().append("text")
      	.attr("class", "bar-label")
      	.attr("x", function(d) {
       		return xscale(Math.min(0, (d as any).value));
      	})
      	.attr("y", function(d) { return yscale((d as any).location )})
      	.attr("dx", function(d) {
        	return (d as any).value < 0 ? 5 : -5;
      	})
      	.attr("dy", yscale.bandwidth())
      	.attr("text-anchor", function(d) {
        	return (d as any).value < 0 ? "start" : "end";
      	})
      	.text(function(d) { return (d as any).location })
        .style("font-size", "8px")

      
    
















      // Define the scales
      // const xscale = d3.scaleBand()
      //   .rangeRound([0, innerWidth])
      //   .padding(0.1);

      // const yscale = d3.scaleLinear()
      //   .rangeRound([margin.left, innerWidth - margin.right]);

      // xscale.domain(data.map(function (d) { return d.location; }));
      // yscale.domain([0, d3.max(data, function (d) { return Number((d as any).value); })]);

      // chart.append('g')
      //       .attr('class', 'axis axis--x')
      //       .attr('transform', svgUtil.translate(0, innerHeight))
      //       .call(d3.axisBottom(xscale));

      // chart.append('g')
      //       .attr('class', 'axis axis--y')
      //       .call(d3.axisLeft(yscale))
      //     .append('text')
      //       .attr('transform', 'rotate(-90)')
      //       .attr('y', 6)
      //       .attr('dy', '0.71em')
      //       .attr('text-anchor', 'end')
      //       .text('Frequency');

      // chart.selectAll('.bar')
      //     .data(data)
      //     .enter().append('rect')
      //       .attr('class', 'bar')
      //       .attr('x', function (d) { return xscale(d.location); })
      //       .attr('y', function (d) { return yscale(d.value); })
      //       .attr('width', xscale.bandwidth())
      //       .attr('height', function (d) { return innerHeight - yscale(d.value); })
      //       .attr('fill', '#4C566A');

     
    }
  }

</script>

<style lang="scss" scoped>
.line-chart-container {
  position: relative;
  display: flex;
  flex-direction: row;
  padding: 5px;
  box-sizing: border-box;
  cursor: pointer;
}
</style>
