<template>
  <section class="simulation-model-panel">
    <settings-bar>
      <counters slot="left" :title="modelName" />
      <div slot="right">
        <button
          class="btn btn-primary"
          type="button"
          @click="$emit('settings')">
          Settings
        </button>
        <button
          class="btn btn-primary"
          title="Expand Model Panel"
          type="button"
          @click="$emit('expand')">
          <font-awesome-icon :icon="['fas', (expanded ? 'compress-alt' : 'expand-alt')]" />
        </button>
      </div>
    </settings-bar>
    <global-graph v-if="model" :data="graph"/>
  </section>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  import { capitalize } from 'lodash';
  import { ModelInterface, ViewInterface } from '@/types/types';
  import { GraphInterface } from '@/types/typesGraphs';
  import Counters from '@/components/Counters.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import GlobalGraph from '@/views/Models/components/Graphs/GlobalGraph.vue';

  const components = {
    Counters,
    GlobalGraph,
    SettingsBar,
  };

  // List of available graphs in a model
  enum VIEWS {
    CAUSAL = 'causal',
    FUNCTIONAL = 'functional',
  }

  @Component({ components })
  export default class ModelPanel extends Vue {
    @Prop({ default: false }) expanded: boolean;
    @Prop({ default: null }) model: ModelInterface;

    private views: ViewInterface[] = [
      { name: capitalize(VIEWS.CAUSAL), id: VIEWS.CAUSAL },
      { name: capitalize(VIEWS.FUNCTIONAL), id: VIEWS.FUNCTIONAL },
    ];

    private selectedView: string = VIEWS.CAUSAL;

    get graph (): GraphInterface {
      return this.selectedView === VIEWS.CAUSAL
        ? this.model?.graph?.abstract
        : this.model?.graph?.detailed;
    }

    get modelName (): string {
      return this.model?.metadata?.name;
    }
  }
</script>
