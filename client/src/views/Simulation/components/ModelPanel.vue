<template>
  <section class="simulation-model-panel">
    <settings-bar>
      <counters slot="left" :title="modelName" :data="countersData" />
      <aside slot="right">
        <div class="dropdown">
          <button
            class="btn btn-primary dropdown-toggle"
            type="button"
            @click="settingsOpen = !settingsOpen">
            Settings
          </button>
          <div class="dropdown-menu dropdown-menu-right" :class="{ 'show': settingsOpen }">
            <h6 class="dropdown-header">Model view</h6>
            <div v-for="(view, index) in views" :key="index" class="custom-control custom-radio">
              <input
                class="custom-control-input"
                name="model-view"
                type="radio"
                v-model="selectedView"
                :id="('model-view-'+index)"
                :value="view.id"
              >
              <label class="custom-control-label" :for="('model-view-'+index)">{{ view.name }}</label>
            </div>
          </div>
        </div>
        <button
          class="btn btn-primary"
          title="Expand Model Panel"
          type="button"
          @click="$emit('expand')">
          <font-awesome-icon :icon="['fas', (expanded ? 'compress-alt' : 'expand-alt')]" />
        </button>
      </aside>
    </settings-bar>
    <global-graph v-if="model" :data="graph"/>
  </section>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  import { Getter } from 'vuex-class';
  import { capitalize } from 'lodash';
  import * as HMI from '@/types/types';
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
    @Prop({ default: null }) model: HMI.ModelInterface;

    @Getter getSimParameters;
    @Getter getSimVariables;

    selectedView: string = VIEWS.CAUSAL;
    settingsOpen: boolean = false;
    views: HMI.ViewInterface[] = [
      { name: capitalize(VIEWS.CAUSAL), id: VIEWS.CAUSAL },
      { name: capitalize(VIEWS.FUNCTIONAL), id: VIEWS.FUNCTIONAL },
    ];

    get graph (): GraphInterface {
      return this.selectedView === VIEWS.CAUSAL
        ? this.model?.graph?.abstract
        : this.model?.graph?.detailed;
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
