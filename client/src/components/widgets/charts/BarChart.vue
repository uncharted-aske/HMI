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
    bottom: 35,
    left: 50
  }
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
    @Prop({default: () => [400, 300]}) size: Array<number>;
    

    mounted(): void {
        this.refresh();
    }    

    refresh():void {
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
        .attr('transform', svgUtil.translate(margin.left, margin.top))

      const data = this.data.filter(d => d.value > 0);

      //Define the scales
      let xscale = d3.scaleBand()
        .rangeRound([0, innerWidth])
        .padding(0.1);

      let yscale = d3.scaleLinear()
        .rangeRound([innerHeight, 0]);


      xscale.domain(data.map(function(d) { return d.location; }));
      yscale.domain([0, d3.max(data, function(d) { return Number((d as any).value); })]);

      chart.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", svgUtil.translate(0, innerHeight))
            .call(d3.axisBottom(xscale));

      chart.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(yscale))
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Frequency");

      chart.selectAll(".bar")
          .data(data)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return xscale(d.location); })
            .attr("y", function(d) { return yscale(d.value); })
            .attr("width", xscale.bandwidth())
            .attr("height", function(d) { return innerHeight - yscale(d.value); })
            .attr('fill', '#4C566A');


      // xscale.domain(data.map(d => d.location));
      // yscale.domain([0, d3.max(data, (d) => {
      //   return Number((d as any).value);
      // })]);

      // console.log(yscale.domain());

      // chart.selectAll(".bar")
      //   .data(data)
      //   // .filter(d => (d as any).value > 0)
      //   .enter().append("rect")
      //   .attr("class", "bar")
      //   .attr("x", (d)=> xscale((d as any).location)) 
      //   .attr("width", xscale.bandwidth())
      //   .attr("y", (d)=> (d as any).value)
      //   .attr("height", (d) =>  height - yscale((d as any).value))
      //   .attr('fill', 'red')

      // const xaxis = d3.axisBottom(xscale);
      // const yaxis = d3.axisLeft(yscale);
      
      // // Add the X axis
      // chart.append('g')
      //   .call(xaxis)
      //   .attr('class', 'x-axis')
      //   .attr('transform', svgUtil.translate(0, height))
      //   .attr('stroke-opacity', 0.5);

      // chart.append("g")
      //     .call(yaxis);


    
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
