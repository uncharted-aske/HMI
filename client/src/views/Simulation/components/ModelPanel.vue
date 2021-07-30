<template>
  <section class="simulation-model-panel">
    <settings-bar>
      <counters slot="left" :title="modelName" :data="countersData" />
      <aside slot="right">
        <div class="btn-group" title="Add/Remove All Parameters & Variables">
          <button
            class="btn btn-secondary"
            title="Add all Parameters & Variables"
            type="button"
            :disabled="allParametersAndVariablesAreDisplayed"
            @click="onAddAllParametersAndVariables"
          >
            <font-awesome-icon :icon="['fas', 'plus']" />
          </button>
          <button
            class="btn btn-secondary"
            title="Remove all Parameters & Variables"
            type="button"
            :disabled="noDisplayedParametersAndVariables"
            @click="onRemoveAllParametersAndVariables"
          >
            <font-awesome-icon :icon="['fas', 'ban']" />
          </button>
        </div>
        <button
          class="btn btn-secondary"
          title="Expand Model Panel"
          type="button"
          @click="$emit('expand')">
          <font-awesome-icon :icon="['fas', (expanded ? 'compress-alt' : 'expand-alt')]" />
        </button>
      </aside>
    </settings-bar>
    <global-graph
      v-if="graph"
      :data="graph"
      :edited-nodes="editedNodes"
      @node-dblclick="onNodeDblClick"
    />
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

    @Getter getSimModel;
    @Getter getSelectedModelGraphType;

    @Action hideAllParameters;
    @Action showAllParameters;
    @Action toggleParameter;

    @Action hideAllVariables;
    @Action showAllVariables;
    @Action toggleVariable;

    settingsOpen: boolean = false;

    onNodeDblClick (selected: Graph.GraphNodeInterface): void {
      this.toggleParameter({ modelId: this.model.id, selector: selected.label });
      this.toggleVariable({ modelId: this.model.id, selector: selected.label });
    }

    get parameters (): HMI.SimulationParameter[] {
      return this.getSimModel(this.model.id).parameters;
    }

    get variables (): HMI.SimulationVariable[] {
      return this.getSimModel(this.model.id).variables;
    }

    get editedNodes (): Graph.SubgraphNodeInterface[] {
      const nodes = this.graph?.nodes;
      if (nodes) {
        const highlightedLabels = [
          ...this.parameters
              .filter(parameter => parameter.edited)
              .map(parameter => parameter.metadata.name),
          ...this.variables
              .filter(variable => variable.edited)
              .map(variable => variable.metadata.name),
        ];

        if (highlightedLabels.length > 0) {
          return nodes
            .filter(node => highlightedLabels.includes(node.label))
            .map(node => ({ id: node.id }));
        }
      }
      return [];
    }

    get graph (): Graph.GraphInterface {
      const selectedModelGraph = this.model?.modelGraph.find(graph => {
        return graph.type === this.getSelectedModelGraphType;
      });
      return selectedModelGraph?.graph ?? null;
    }

    get modelName (): string {
      return this.model?.metadata?.name;
    }

    get countersData (): HMI.Counter[] {
      const data = [];
      if (this.parameters.length > 0) {
        data.push({
          name: 'Parameters',
          value: this.parameters.length,
        });
      }
      if (this.variables.length > 0) {
        data.push({
          name: 'Variables',
          value: this.variables.length,
        });
      }
      return data;
    }

    get nbDisplayedParameters (): number {
      return this.parameters.filter(parameter => parameter.edited).length;
    }

    get nbDisplayedVariables (): number {
      return this.variables.filter(variable => variable.edited).length;
    }

    get allParametersAndVariablesAreDisplayed (): boolean {
      return this.nbDisplayedParameters === this.parameters.length &&
        this.nbDisplayedVariables === this.variables.length;
    }

    get noDisplayedParametersAndVariables (): boolean {
      return this.nbDisplayedParameters === 0 &&
        this.nbDisplayedVariables === 0;
    }

    onAddAllParametersAndVariables (): void {
      this.showAllParameters();
      this.showAllVariables();
    }

    onRemoveAllParametersAndVariables (): void {
      this.hideAllParameters();
      this.hideAllVariables();
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
