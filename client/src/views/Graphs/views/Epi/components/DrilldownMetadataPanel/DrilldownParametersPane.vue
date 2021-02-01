<template>
  <div class="drilldown-parameters-pane-container">
    <div >
      <histogram :data="getParameters"/>
    </div>

    <!-- <div v-else class="alert alert-info" role="alert">
      No parameters at the moment
    </div> -->
    <!-- <modal-knowledge
      v-if="showModal"
      @close="showModal = false"
     /> -->
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import { Getter } from 'vuex-class';

  import CollapsibleItem from '@/components/CollapsibleItem.vue';
  import Histogram from '@/components/widgets/charts/Histogram.vue';


  const components = {
    CollapsibleItem,
    Histogram,
  };

  @Component({ components })
  export default class DrilldownParametersPane extends Vue {
    @Prop({ default: null }) metadata: any;
    showModal: boolean = false;

    @Getter getSelectedModelIds;
    @Getter getParameters;

    get formatParametersData(): any {
      let parametersArray = [];
      Object.keys(this.getParameters).forEach(key => {
        parametersArray.push(this.getParameters[key]);
      })
      return parametersArray;
    }

   
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

</style>
