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
// Model representations
import ChimeGTRI from '../assets/formatted-CHIME-SIR-GTRI.json'
import ChimeGrFN from '../assets/formatted-CHIME-SIR-GrFN.json'
import ChimeCAG from '../assets/formatted-CHIME-SIR-CAG.json'
import ChimeIR from '../assets/formatted-CHIME-IR_CHIME-GTRI-IR.json'

import ModelRenderer from '@/graphs/elk/model-renderer'
import { layered } from '@/graphs/elk/elk-strategies'

export default {
  name: 'EpiView',
  data: () => ({
    modelsList: ['ChimeIR', 'ChimeGTRI', 'ChimeCAG', 'ChimeGrFN'],
    selectedModel: 'ChimeIR',
    graphData: ChimeIR
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
    this.renderer = new ModelRenderer({
      el: this.$refs.test,
      strategy: layered,
      nodeWidth: 120,
      nodeHeight: 30,

      useEdgeControl: false,
      edgeControlOffsetType: 'unit',
      edgeControlOffset: -20
    })

    // this.renderer.setCallback('nodeClick', (node) => {
    //   const props = node.datum().data;
    //   console.log(props);
    //   // this.parameters = props.parameters;
    // });

    this.refresh()
  },
  methods: {
    refresh () {
      const groups = this.graphData.groups || []
      this.renderer.setData(this.graphData, { groups })
      this.renderer.render()
    },
    setModel (e) {
      const model = e.target.value
      this.selectedModel = model

      switch (this.selectedModel) {
        case 'ChimeIR':
          this.graphData = ChimeIR
          break
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
