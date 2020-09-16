<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <h2>Epidemiological View</h2>
        <select
         class="custom-select"
          @change="setModel"
        >
          <option
            disabled
            value=""
          >Please select one model representation</option>
          <option
            v-for="item in modelsList"
            :key="item"
            :value="item"
            :selected="item === selectedModel"
          >{{ item }}</option>
        </select>
        <!-- <button
          class="btn btn-primary btn-xs"
          @click="highlight()">Highlight
        </button> -->
          <div
            ref="test"
            style="width:1000px; height: 800px; border: 1px solid #888"
          />
        <!-- <div class="parallel-views">
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

// Model representations
import ChimeGTRI from '../assets/formatted-CHIME-SIR-GTRI.json'
import ChimeGrFN from '../assets/formatted-CHIME-SIR-GrFN.json'
import ChimeCAG from '../assets/formatted-CHIME-SIR-CAG.json'

export default {
  name: 'EpiView',
  data: () => ({
    modelsList: ['ChimeGTRI', 'ChimeGrFN', 'ChimeCAG'],
    selectedModel: 'ChimeGrFN',
    graphData: ChimeGrFN
  }),
  methods: {
    refresh () {

    },
    setModel (e) {
      const model = e.target.value
      this.selectedModel = model

      switch (this.selectedModel) {
        case 'ChimeGTRI':
          this.graphData = ChimeGTRI
          break
        case 'ChimeGrFN':
          this.graphData = ChimeGrFN
          break
        case 'ChimeCAG':
          this.graphData = ChimeCAG
          break
        default:
          console.error('Switching to invalid dataset: ' + this.selectedModel)
          break
      }
    }

  }
}
</script>

<style lang="scss" scoped>
</style>
