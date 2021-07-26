<template>
  <section
    class="simulation-parameters-panel"
    :style="{
      '--padding': padding + 'px',
      '--parameter-height': parameterHeight + 'px',
    }"
  >
    <settings-bar>
      <counters
        slot="left"
        :title="countersTitle"
        :data="countersData"
      />
      <aside slot="right">
        <div class="btn-group" title="Add/Remove All Parameters & Variables">
          <button
            class="btn btn-secondary"
            title="Add all Parameters & Variables"
            type="button"
            :disabled="allParametersAreDisplayed"
            @click="onAddAllParameters"
          >
            <font-awesome-icon :icon="['fas', 'plus']" />
          </button>
          <button
            class="btn btn-secondary"
            title="Remove all Parameters & Variables"
            type="button"
            :disabled="noDisplayedParameters"
            @click="onRemoveAllParameters"
          >
            <font-awesome-icon :icon="['fas', 'ban']" />
          </button>
        </div>
        <button
          class="btn btn-secondary"
          title="Expand Parameters Panel"
          type="button"
          @click="$emit('expand')">
          <font-awesome-icon :icon="['fas', (expanded ? 'compress-alt' : 'expand-alt')]" />
        </button>
      </aside>
    </settings-bar>
    <div class="parameters">
      <figure class="parameters-graph" ref="figure"><svg /></figure>
      <div v-if="noDisplayedParameters" class="alert alert-info m-3">
        Use the model visualization on the left to add/remove parameters.
      </div>
      <ul v-else class="parameters-list">
        <li
          class="parameter"
          v-for="(parameter, index) of displayedParameters"
          :key="index"
          :class="{ hidden: parameter.hidden }"
        >
          <h4 :title="parameter.metadata.Description">{{ parameter.metadata.name }}</h4>
          <input type="text" :value="getCurrentValue(parameter)" @change="e => onParameterChange(parameter.uid, e)" />
          <aside class="btn-group">
            <button
              class="btn btn-secondary btn-sm"
              title="Remove parameter from editable panel"
              type="button"
              @click="hideParameter({ modelId, selector: parameter.uid })"
            >
              <font-awesome-icon :icon="['fas', 'ban']" />
            </button>
          </aside>
        </li>
      </ul>
    </div>
  </section>
</template>

<script lang="ts">
  import _ from 'lodash';
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Action, Getter } from 'vuex-class';
  import { InjectReactive, Prop, Watch } from 'vue-property-decorator';
  import * as d3 from 'd3';
  import svgUtil from '@/utils/SVGUtil';
  import { shorterNb } from '@/utils/NumberUtil';
  import * as HMI from '@/types/types';
  import Counters from '@/components/Counters.vue';
  import SettingsBar from '@/components/SettingsBar.vue';

  const components = {
    Counters,
    SettingsBar,
  };

  @Component({ components })
  export default class ParametersPanel extends Vue {
    @Prop({ default: false }) expanded: boolean;
    @Prop({ default: null }) modelId: number;
    @InjectReactive() resized!: boolean;
    @InjectReactive() isResizing!: boolean;

    @Getter getSimModel;
    @Getter getSimParameterArray;
    @Action setSimParameterValue;
    @Action hideParameter;
    @Action hideAllParameters;
    @Action showAllParameters;
    @Action hideAllVariables;
    @Action showAllVariables;

    private padding: number = 5;
    private parameterHeight: number = 100;

    // Condition when to re/draw the Graph
    @Watch('resized') onResized (): void { this.resized && this.drawGraph(); }
    @Watch('expanded') onExpanded (): void { this.drawGraph(); }
    @Watch('displayedParameters') onDisplayedParametersChanged (): void { this.drawGraph(); }
    mounted (): void { this.drawGraph(); }

    // Condition when to clear the Graph
    @Watch('isResizing') onIsResising (): void { this.isResizing && this.clearGraph(); }

    get parameters (): HMI.SimulationParameter[] {
      const parameters = this.getSimModel(this.modelId)?.parameters ?? [];
      // Order by ASC order
      return _.orderBy(parameters, ['metadata.name'], ['asc']);
    }

    get displayedParameters (): HMI.SimulationParameter[] {
      return this.parameters.filter(parameter => parameter.edited);
    }

    get noDisplayedParameters (): boolean {
      return this.displayedParameters.length === 0;
    }

    get allParametersAreDisplayed (): boolean {
      return this.displayedParameters.length === this.parameters.length;
    }

    get countersTitle (): string {
      const count = this.displayedParameters.length;
      return `${count > 0 ? count : '—'} Parameter${count > 1 ? 's' : ''}`;
    }

    get countersData (): HMI.Counter[] {
      const displayed = this.displayedParameters.length;
      const total = this.parameters.length;
      if (displayed < total) {
        return [{ name: 'total', value: total }];
      }
    }

    getCurrentValue (parameter: HMI.SimulationParameter): number {
      return parameter.values.slice(-1)[0];
    }

    graphHeight (): number {
      return this.displayedParameters.length * this.parameterHeight;
    }

    graphWidth (): number {
      const figure = this.$refs.figure as HTMLElement;
      return figure?.getBoundingClientRect().width ?? 0;
    }

    onParameterChange (uid: string, event: Event): void {
      const value = Number((event.target as HTMLInputElement).value);
      this.setSimParameterValue({ modelId: this.modelId, uid, value });
    }

    /** Return the CSS selector to target this model parameters graph. */
    get graphSelector (): string {
      // the ID `parameters_X` is from the Simulation.vue.
      return `#parameters_${this.modelId} .parameters-graph svg`;
    }

    clearGraph (): void {
      d3.select(this.graphSelector).selectAll('*').remove();
    }

    drawGraph (): void {
      // List of parameters by uid
      const params = this.displayedParameters.map(parameter => parameter.uid);

      // List of runs
      const runs = this.getSimParameterArray?.[this.modelId];
      if (!runs) return;

      // Select the graph and size it
      this.clearGraph();
      const graph = d3.select(this.graphSelector);
      svgUtil.createChart(graph, this.graphWidth(), this.graphHeight());

      // Dimensions
      const marginX = this.graphWidth() * 0.25;
      const marginY = this.parameterHeight / 2;
      const xMinMax = [marginX, this.graphWidth() - marginX];
      const yMinMax = [marginY, this.graphHeight() - marginY];

      // X & Y Scales
      const xScale = param => {
        const minMax = svgUtil.extendRoundUpToPow10(runs, d => d[param] ?? 0) as Iterable<d3.NumberValue>;
        return {
          min: minMax[0],
          max: minMax[1],
          scale: d3.scaleLinear(minMax, xMinMax),
        };
      };
      const xScales = new Map(params.map(param => [param, xScale(param)]));
      const yScale = d3.scalePoint(params, yMinMax);

      // Runs Line method
      const line = d3.line()
        /* @ts-ignore */
        .x(([param, value]) => xScales.get(param).scale(value))
        /* @ts-ignore */
        .y(([param]) => yScale(param));

      // Add the runs
      graph.append('g')
        .selectAll('path')
          .data(runs)
          .join('path')
            .attr('class', (d, index) => {
              // the current run is the last index
              if (index === runs.length - 1) {
                return 'current run';
              }
              return 'run';
            })
            /* @ts-ignore */
            .attr('d', d => line(d3.cross(params, [d], (param, d) => [param, d[param]])))
          .append('title')
            .text((d, index) => index);

      // Add the axis
      graph.append('g')
          .selectAll('g')
          .data(params)
          .join(enter => {
            // Group for the parameter translated vertically
            const g = enter.append('g')
              .attr('class', d => d + ' axis')
              .attr('transform', d => svgUtil.translate(0, yScale(d)));

            // the axis
            g.append('line')
              .attr('x1', xMinMax[0])
              .attr('x2', xMinMax[1]);

            // min label
            g.append('text')
              .attr('x', xMinMax[0])
              .text(d => shorterNb(xScales.get(d).min));

            // max label
            g.append('text')
              .attr('x', xMinMax[1])
              .text(d => shorterNb(xScales.get(d).max));

            return g;
          });
    }

    onAddAllParameters (): void {
      this.showAllParameters(this.modelId);
      this.showAllVariables(this.modelId);
    }

    onRemoveAllParameters (): void {
      this.hideAllParameters(this.modelId);
      this.hideAllVariables(this.modelId);
    }
  }
</script>

<style scoped>
  .simulation-parameters-panel {
    color: white;
    display: flex;
    flex-direction: column;
  }

  .parameters {
    background-color: var(--bg-graphs);
    flex-grow: 1;
    overflow-y: scroll;
    position: relative;
  }

  .parameters-graph,
  .parameters-list {
    bottom: 0;
    left: 0;
    margin: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  .parameters-list {
    list-style: none;
    padding: 0;
  }

  .parameter {
    display: grid;
    grid-template-areas:
      ". . ."
      "name . action"
      "value . ."
    ;
    grid-template-columns: min-content auto min-content;
    grid-template-rows: 1fr 2em 1fr;
    height: var(--parameter-height);
    padding: var(--padding);
  }

  .parameter:last-of-type {
    /* Small spacing to have some empty space at the bottom of the scroll bar. */
    margin-bottom: 2em;
  }

  .parameter h4 {
    font-size: 1em;
    font-weight: bold;
    grid-area: name;
    line-height: 2em;
    margin: 0;
  }

  .parameter input {
    background-color: var(--bg-body);
    border: none;
    border-radius: 3px;
    color: inherit;
    font-size: .8em;
    font-weight: bold;
    grid-area: value;
    padding: .25em .5em;
    width: 5em;
  }

  .parameter .btn-group {
    grid-area: action;
  }

  .parameter .btn-group button {
    padding-bottom: 0;
    padding-top: 0;
  }

  .parameter.hidden {
    opacity: 0.5;
  }
</style>
<style>
  /* For SVG you cannot scope the <style> */

  .parameters-graph .axis line {
    fill: none;
    stroke: var(--colours-nodes-other);
    stroke-width: 1;
  }

  .parameters-graph .axis text {
    font-size: 10px;
    stroke: var(--text-color-light);
  }
  .parameters-graph .axis text:first-of-type { translate: -1.5em .3em; }
  .parameters-graph .axis text:last-of-type { translate: .75em .3em; }

  .parameters-graph .run {
    fill: none;
    stroke: var(--colours-nodes-other);
    stroke-width: 3;
  }

  .parameters-graph .run.current {
    stroke: var(--colours-nodes-default);
  }
</style>
