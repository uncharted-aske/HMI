<template>
  <div v-if="!isEmptyData" class="h-100 d-flex flex-column parameters-pane-container">
      <div class="parameter-title">{{title | capitalize-first-letter-formatter}} </div>
      <scatter-plot :data="data" :size="[400, 500]" @dot-click="onDotClick"/>
      <div class="parameter-title">Related Parameters </div>
      <div class="position-relative flex-grow-1">
        <div class="position-absolute h-100 w-100 related-params hide-scrollbar">
          <div class="mb-1 px-2 py-2 d-flex rounded-lg border" v-for="(param, index) in related" :key="index">
            <div class="flex-grow-1">
                <h6>{{param[0] | underscore-remover-formatter | capitalize-first-letter-formatter}}</h6>
                <div> {{param[1]}}</div>
            </div>
          </div>
        </div>
      </div>
  </div>
 <message-display v-else class="m-3">
      <span slot="message">
        No metadata at the moment.
      </span>
    </message-display>
</template>

<script lang="ts">
  import _ from 'lodash';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import ScatterPlot from '@/components/widgets/charts/ScatterPlot.vue';
  import MessageDisplay from '@/components/widgets/MessageDisplay.vue';

  const components = {
    ScatterPlot,
    MessageDisplay,
  };

  @Component({ components })
  export default class ParametersPane extends Vue {
    @Prop({ default: null }) data: any;
    @Prop({ default: null }) related: any;

    get isEmptyData (): boolean {
      return _.isEmpty(this.data);
    }

    get title (): string {
      return !_.isEmpty(this.data) && this.data[0].variable;
    }

    onDotClick (doi:string): void {
      this.$emit('open-modal', doi);
    }
  }
</script>

<style scoped>
  .parameters-pane-container {
    padding: 5px;
  }

  .parameter-title {
    font-weight: bold;
  }

  .related-params {
    overflow: hidden scroll;
  }
</style>
