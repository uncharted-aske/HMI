<template>
  <div class="drilldown-parameters-pane-container">
    <div v-if="!isEmptyMetadata" >
     
        
    </div>

    <div v-else class="alert alert-info" role="alert">
      No parameters at the moment
    </div>
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


  const components = {
    CollapsibleItem,
  };


  @Component({ components })
  export default class DrilldownParametersPane extends Vue {
    @Prop({ default: null }) metadata: any;
    showModal: boolean = false;

    @Getter getSelectedModelIds;
    @Getter getParameters;

    get isEmptyMetadata (): boolean {
      return _.isEmpty(this.metadata);
    }
  
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";


</style>
