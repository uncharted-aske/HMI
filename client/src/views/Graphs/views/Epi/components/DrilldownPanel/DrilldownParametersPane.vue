<template>
  <div class="drilldown-parameters-pane-container">
    <div>
      <div class="parameter-title">Doubling Time (days) </div>
      <div class="parameter-desc">The time required for the number of infections to double </div>
      <bar-chart :data="formatParametersData" :size="[400, 500]" @bar-click="onBarClick"/>
    </div>
      <div>
        <div>Related Parameters </div>
      </div>
    <div>
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter } from 'vuex-class';

  import CollapsibleItem from '@/components/CollapsibleItem.vue';
  import BarChart from '@/components/widgets/charts/BarChart.vue';

  const components = {
    CollapsibleItem,
    BarChart,
  };

  @Component({ components })
  export default class DrilldownParametersPane extends Vue {
    @Getter getSelectedModelIds;
    @Getter getParameters;

    get formatParametersData (): any {
      const parametersArray = [];
      Object.keys(this.getParameters).forEach(key => {
        parametersArray.push(this.getParameters[key]);
      });
      return parametersArray;
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
