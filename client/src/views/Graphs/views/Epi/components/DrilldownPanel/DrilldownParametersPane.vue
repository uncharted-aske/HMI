<template>
  <div class="drilldown-parameters-pane-container">
    <div v-if="!isEmptyData">
      <div class="parameter-title">{{title | capitalize-first-letter-formatter}} </div>
      <bar-chart :data="data" :size="[400, 500]" @bar-click="onBarClick"/>
      <div>Related Parameters </div>
    </div>
    <div v-else class="alert alert-info" role="alert">
      No metadata at the moment
    </div>
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import CollapsibleItem from '@/components/CollapsibleItem.vue';
  import BarChart from '@/components/widgets/charts/BarChart.vue';

  const components = {
    CollapsibleItem,
    BarChart,
  };

  @Component({ components })
  export default class DrilldownParametersPane extends Vue {
    @Prop({ default: null }) data: any;

     get isEmptyData (): boolean {
      return _.isEmpty(this.data);
    }

    get title(): string {
      return !_.isEmpty(this.data) && this.data[0].variable;
    }

    onBarClick (doi:string): void {
      this.$emit('open-modal', doi);
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.drilldown-parameters-pane-container {
  padding: 5px;
  .parameter-title {
    font-weight: bold;
  }
}

</style>
