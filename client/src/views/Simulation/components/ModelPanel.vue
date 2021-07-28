<template>
  <section class="simulation-model-panel">
    <settings-bar>
      <counters slot="left" :title="modelName" :data="countersData" />
      <aside slot="right">
        <button
          class="btn btn-secondary"
          title="Expand Model Panel"
          type="button"
          @click="$emit('expand')">
          <font-awesome-icon :icon="['fas', (expanded ? 'compress-alt' : 'expand-alt')]" />
        </button>
      </aside>
    </settings-bar>
    <global-graph v-if="model" :data="graph" :edited-nodes="editedNodes" @node-dblclick="onNodeClick"/>
  </section>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  import { Action, Getter } from 'vuex-class';
  import * as HMI from '@/types/types';
  import * as Model from '@/types/typesModel';
  import * as Graph from '@/types/typesGraphs';
  import Counters from '@/components/Counters.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import GlobalGraph from '@/views/Models/components/Graphs/GlobalGraph.vue';

  const components = {
    Counters,
    GlobalGraph,
    SettingsBar,
  };

  @Component({ components })
  export default class ModelPanel extends Vue {
    @Prop({ default: false }) expanded: boolean;
    @Prop({ default: null }) model: Model.Model;

    @Getter getSimParameters;
    @Getter getSimVariables;
    @Action toggleParameter;
    @Action toggleVariable;

    settingsOpen: boolean = false;

    onNodeClick (selected: Graph.GraphNodeInterface): void {
      this.toggleParameter(selected.label);
      this.toggleVariable(selected.label);
    }

    get editedNodes (): Graph.SubgraphNodeInterface[] {
      const highlightedLabels = [
        ...this.getSimParameters.filter(parameter => parameter.edited).map(parameter => parameter.metadata.name),
        ...this.getSimVariables.filter(variable => variable.edited).map(variable => variable.metadata.name),
      ];
      return this.graph.nodes.filter(node => highlightedLabels.includes(node.label)).map(node => ({ id: node.id }));
    }

    get graph (): Graph.GraphInterface {
      return this.model?.modelGraph?.[0]?.graph;
    }

    get modelName (): string {
      return this.model?.metadata?.name;
    }

    get countersData (): HMI.Counter[] {
      const data = [];
      if (this.getSimParameters.length > 0) {
        data.push({
          name: 'Parameters',
          value: this.getSimParameters.length,
        });
      }
      if (this.getSimVariables.length > 0) {
        data.push({
          name: 'Variables',
          value: this.getSimVariables.length,
        });
      }
      return data;
    }
  }
</script>

<style scoped>
  .settings-bar-container aside {
    display: flex;
    gap: .3em;
  }

  .dropdown-menu {
    padding: 1em;
  }

  .dropdown-header {
    padding: 0 1.5em .5em 0;
  }
</style>
