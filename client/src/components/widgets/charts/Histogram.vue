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
    right: 40,
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
export default class Histogram extends Vue {
    @Prop({ default: null }) data: any;

    mounted(): void {
        this.refresh();
    }    

    refresh():void {
      if (_.isEmpty(this.data)) return;
      const data = this.data;
      const svg = d3.select(this.$refs.container as any);

      // Set the dimensions and margins of the chart
      const margin = {top: 20, right: 20, bottom: 50, left: 100},
                      width = 460 - margin.left - margin.right,
                      height = 400 - margin.top - margin.bottom;

      svg.selectAll('*').remove();
      const chart = svgUtil.createChart(svg, width, height)
        .append('g')
        .attr('transform', svgUtil.translate(margin.left, margin.top));

      //Define the scales
      let x = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1);

      let y = d3.scaleLinear()
        .rangeRound([height, 0]);


      // x.domain(data.map((d)=> {
      //   console.log(d);
      // }));
      // y.domain([0, d3.max(data, function (d) {
      //       return Number(d.Speed);
      // })]);




      // const xaxis = d3.axisBottom()
      //   .scale(xscale)
      //   .tickSizeOuter(0)
      //   .tickValues(ticksXaxis);

      // const yaxis = d3.axisLeft()
      //   .scale(yscale)
      //   .tickValues(ticksYAxis)
      //   .tickFormat(indicatorValueFormatter);

      // // Add the X axis
      // this.chart.append('g')
      //   .call(xaxis)
      //   .attr('class', 'x-axis')
      //   .attr('transform', svgUtil.translate(0, yscale(0)))
      //   .attr('stroke-opacity', 0.5);



      
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
  background: #FFF;
}
</style>
