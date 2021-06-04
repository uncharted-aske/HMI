<template>
  <section
    class="simulation-parameters-container"
    :style="{
      '--padding': padding + 'px',
      '--parameter-height': parameterHeight + 'px',
    }"
  >
    <settings-bar>
      <div class="btn-group" slot="left" aria-label="Show/Hide Parameters">
        <button
          class="btn btn-primary"
          title="Show all parameters"
          type="button"
          @click="onShowAllParameters"
        >
          <font-awesome-icon :icon="['fas', 'eye']" />
        </button>
        <button
          class="btn btn-primary"
          title="Hide all parameters"
          type="button"
          @click="onHideAllParameters"
        >
          <font-awesome-icon :icon="['fas', 'eye-slash']" />
        </button>
      </div>
      <counters
        slot="middle"
        :title="countersTitle"
        :data="countersData"
      />
      <div slot="right">
        <button
          class="btn btn-primary"
          type="button"
          @click="$emit('settings')">
          Settings
        </button>
        <button
          class="btn btn-primary"
          title="Expand Parameters view"
          type="button"
          @click="$emit('expand')">
          <font-awesome-icon :icon="['fas', (expanded ? 'compress-alt' : 'expand-alt')]" />
        </button>
      </div>
    </settings-bar>
    <div class="parameters">
      <figure class="parameters-graph" ref="figure">
        <svg :viewBox="graphViewBox" />
      </figure>
      <ul class="parameters-list">
        <li
          class="parameter"
          v-for="(parameter, index) of parameters"
          :key="index"
          :class="{ hidden: parameter.hidden }"
        >
          <h4>{{ parameter.name }}</h4>
          <input type="text" :value="parameter.defaultValue" />
          <aside class="btn-group">
            <button type="button" class="btn btn-primary btn-sm">
              <font-awesome-icon :icon="['fas', 'tools']" />
            </button>
            <button
              class="btn btn-primary btn-sm"
              title="(parameter.hidden ? 'Show' : 'Hide' + ' parameter')"
              type="button"
              @click="parameter.hidden = !parameter.hidden"
            >
              <font-awesome-icon :icon="['fas', (parameter.hidden ? 'eye' : 'eye-slash')]" />
            </button>
          </aside>
        </li>
      </ul>
    </div>
  </section>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, Watch } from 'vue-property-decorator';
  import * as d3 from 'd3';

  import * as HMI from '@/types/types';
  import * as Donu from '@/types/typesDonu';

  import Counters from '@/components/Counters.vue';
  import SettingsBar from '@/components/SettingsBar.vue';

  const components = {
    Counters,
    SettingsBar,
  };

  @Component({ components })
  export default class SimulationParameters extends Vue {
    @Prop({ default: [] }) donuParameters: Donu.ModelParameter[];
    @Prop({ default: false }) expanded: boolean;

    private padding: number = 5;
    private parameterHeight: number = 100;
    parameters: HMI.SimulationParameter[] = [];

    @Watch('donuParameters') onDonuParametersChanged (): void {
      this.parameters = this.donuParameters.map(donuParameter => {
        return { ...donuParameter, hidden: false } as HMI.SimulationParameter;
      });

      this.drawGraph();
    }

    get countersTitle (): string {
      return this.parameters.length + ' Parameters';
    }

    get countersData (): HMI.Counter[] {
      const count = this.parameters.filter(parameter => parameter.hidden).length ?? 0;
      if (count === this.parameters.length) {
        return [{ name: 'All hidden' }];
      } else if (count > 0) {
        return [{ name: 'Hidden', value: count }];
      }
    }

    /** Get the list of parameters values for each runs. */
    get runs (): HMI.SimulationRun[] {
      const runs = [];

      // For now, we create a unique fake run.
      const fakeRun = this.parameters.reduce((run, parameter) => {
        run[parameter.name] = parameter.defaultValue;
        return run;
      }, {});
      runs.push(fakeRun);

      return runs;
    }

    graphHeight (): number {
      return this.parameters.length * this.parameterHeight;
    }

    graphWidth (): number {
      const figure = this.$refs.figure as HTMLElement;
      return figure?.getBoundingClientRect().width ?? 350;
    }

    get graphViewBox (): string {
      return `0 0 ${this.graphWidth()} ${this.graphHeight()}`;
    }

    drawGraph (): void {
      // List of parameters names
      const params = this.parameters.map(parameter => parameter.name);

      // Get and empty the graph
      const graph = d3.select('.parameters-graph svg');
      graph.selectAll('*').remove();

      // Dimensions
      const marginX = this.graphWidth() * 0.25;
      const marginY = this.parameterHeight / 2;
      const xMinMax = [marginX, this.graphWidth() - marginX];
      const yMinMax = [marginY, this.graphHeight() - marginY];

      // X & Y Scales
      const xScale = param => d3.scaleLinear(d3.extent(this.runs, d => d[param]), xMinMax);
      const xScales = new Map(params.map(param => [param, xScale(param)]));
      const yScale = d3.scalePoint(params, yMinMax);

      // Runs Line method
      const line = d3.line()
        .defined(([, value]) => value != null)
        /* @ts-ignore */
        .x(([param, value]) => xScales.get(param)(value))
        /* @ts-ignore */
        .y(([param]) => yScale(param));

      // Add the runs
      graph.append('g')
        .attr('fill', 'none').attr('stroke-width', 5) // .attr('stroke-opacity', 1)
        .selectAll('path')
          .data(this.runs)
          .join('path')
            .attr('stroke', 'chartreuse')
            /* @ts-ignore */
            .attr('d', d => line(d3.cross(params, [d], (param, d) => [param, d[param]])))
          .append('title')
            .text((d, index) => index);

      // Add the axis
      graph.append('g')
        .selectAll('g')
          .data(params)
          .join('g')
            .attr('transform', d => `translate(0, ${yScale(d)})`)
            .each(function (d) { d3.select(this).call(d3.axisBottom(xScales.get(d))); })
            .call(g => g.append('text').text(d => d));
    }

    onHideAllParameters (): void {
      this.parameters.forEach(parameter => { parameter.hidden = true; });
    }

    onShowAllParameters (): void {
      this.parameters.forEach(parameter => { parameter.hidden = false; });
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

  .simulation-parameters-container {
    color: white;
    display: flex;
    flex-direction: column;
  }

  .settings-bar-container {
    flex-shrink: 0;
  }

  .parameters {
    background-color: $bg-graphs;
    flex-grow: 1;
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
    padding: var(--padding);
  }

  .parameter {
    height: var(--parameter-height);
  }

  .parameter .btn-group button {
    padding-bottom: 0;
    padding-top: 0;
  }

  .parameter.hidden {
    input {
      display: none;
      pointer-events: none;
    }
  }
</style>
