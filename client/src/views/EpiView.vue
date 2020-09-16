<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-12 experiments">
        <h2>Epidemiological View</h2>
        <!-- <select
          @change="setModel"
        >
          <option
            disabled
            value=""
          >Please select one model</option>
          <option
            v-for="item in modelsList"
            :key="item"
            :value="item"
            :selected="item === selectedModel"
          >{{ item }}</option>
        </select> -->
        <!-- <button
          class="btn btn-primary btn-xs"
          @click="highlight()">Highlight
        </button>
        <div class="parallel-views">
          <div
            ref="test"
            style="width:1800px; height: 800px; border: 1px solid #888"
          />
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
// import _ from 'lodash'
// import * as d3 from 'd3'

export default {
  name: 'EpiView'
}
</script>

<style lang="scss" scoped>
</style>
