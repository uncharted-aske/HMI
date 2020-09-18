<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-3">
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
      </div>
    </div>
    <div class="row">
       <div class="col">
           <div
            ref="test"
            style="width:100%; height: 800px;"
          />
        </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

// Model representations
import ChimeGTRI from '../assets/formatted-CHIME-SIR-GTRI.json'
import ChimeGrFN from '../assets/formatted-CHIME-SIR-GrFN-new.json'
import ChimeCAG from '../assets/formatted-CHIME-SIR-CAG-new.json'
import ChimeIR from '../assets/formatted-CHIME-IR_CHIME-GTRI-IR'

import DSSATPetasceCAG from '../assets/formatted-PETASCE-CAG'
import DSSATPetasceGrFN from '../assets/formatted-PETASCE-GrFN'
import DSSATPetdynCAG from '../assets/formatted-PETDYN-CAG'
import DSSATPetdynGrFN from '../assets/formatted-PETDYN-GrFN'

import SIRCAG from '../assets/formatted-SIR-simple-CAG'
import SIRGrFN from '../assets/formatted-SIR-simple-GrFN'

import ModelRenderer from '@/graphs/elk/model-renderer'
import { layered } from '@/graphs/elk/elk-strategies'
import { showTooltip, hideTooltip } from '@/utils/svg-util'

const DEFAULT_RENDERING_OPTIONS = {
  nodeWidth: 120,
  nodeHeight: 30
}

const PETRI_NET_RENDERING_OPTIONS = {
  nodeWidth: 50,
  nodeHeight: 70
}

export default {
  name: 'EpiView',
  data: () => ({
    modelsList: ['ChimeIR', 'ChimeGTRI', 'ChimeCAG', 'ChimeGrFN', 'SIRCAG', 'SIRGrFN', 'DSSATPetasceCAG', 'DSSATPetasceGrFN', 'DSSATPetdynCAG', 'DSSATPetdynGrFN'],
    selectedModel: 'ChimeIR',
    graphData: ChimeIR,
    renderingOptions: DEFAULT_RENDERING_OPTIONS
  }),
  watch: {
    graphData () {
      this.refresh()
    }
  },
  created () {
    this.renderer = null
  },
  mounted () {
    this.refresh()
  },
  methods: {
    refresh () {
      this.renderer = new ModelRenderer(Object.assign({}, {
        el: this.$refs.test,
        strategy: layered,

        useEdgeControl: false,
        edgeControlOffsetType: 'unit',
        edgeControlOffset: -20
      }, this.renderingOptions))

      this.renderer.setCallback('nodeMouseEnter', (node) => {
        const nodeData = node.datum()
        let nodeCoords = []
        const metadata = JSON.stringify(nodeData.data.metadata)
        if (_.isNil(nodeData.group)) {
          nodeCoords = [nodeData.x + (nodeData.width * 0.5), nodeData.y + (nodeData.height * 0.5)]
        } else {
          // For nodes inside groups
          const groups = this.renderer.layout.groups
          const group = groups.find(g => g.id === nodeData.group)
          nodeCoords = [group.x + nodeData.x, group.y + nodeData.y]
        }
        showTooltip(this.renderer.chart, metadata, nodeCoords)
      })

      this.renderer.setCallback('nodeMouseLeave', (node) => {
        hideTooltip(this.renderer.chart)
      })

      const groups = this.graphData.groups || []
      this.renderer.setData(this.graphData, { groups })
      this.renderer.render()
    },
    setModel (e) {
      const model = e.target.value
      this.selectedModel = model

      switch (this.selectedModel) {
        case 'ChimeIR':
          this.renderingOptions = DEFAULT_RENDERING_OPTIONS
          this.graphData = ChimeIR
          break
        case 'ChimeGTRI':
          this.renderingOptions = PETRI_NET_RENDERING_OPTIONS
          this.graphData = ChimeGTRI
          break
        case 'ChimeGrFN':
          this.renderingOptions = DEFAULT_RENDERING_OPTIONS
          this.graphData = ChimeGrFN
          break
        case 'ChimeCAG':
          this.renderingOptions = DEFAULT_RENDERING_OPTIONS
          this.graphData = ChimeCAG
          break
        case 'SIRCAG':
          this.renderingOptions = DEFAULT_RENDERING_OPTIONS
          this.graphData = SIRCAG
          break
        case 'SIRGrFN':
          this.renderingOptions = DEFAULT_RENDERING_OPTIONS
          this.graphData = SIRGrFN
          break
        case 'DSSATPetasceGrFN':
          this.renderingOptions = DEFAULT_RENDERING_OPTIONS
          this.graphData = DSSATPetasceGrFN
          break
        case 'DSSATPetasceCAG':
          this.renderingOptions = DEFAULT_RENDERING_OPTIONS
          this.graphData = DSSATPetasceCAG
          break
        case 'DSSATPetdynCAG':
          this.renderingOptions = DEFAULT_RENDERING_OPTIONS
          this.graphData = DSSATPetdynCAG
          break
        case 'DSSATPetdynGrFN':
          this.renderingOptions = DEFAULT_RENDERING_OPTIONS
          this.graphData = DSSATPetdynGrFN
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
