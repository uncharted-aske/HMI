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
// import svgUtil from '@/utils/svg-util';
// import dateFormatter from '@/filters/date-formatter';
// import indicatorValueFormatter from '@/filters/indicator-value-formatter';
// import { DEFAULT_COLOR, SELECTED_COLOR, MARKER_COLOR } from '@/utils/colors-util';

// const RESIZE_DELAY = 50;

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

    mounted(): void {
        this.refresh();
    }    

    refresh():void {
        console.log('test');
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
