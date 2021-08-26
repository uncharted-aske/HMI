<template>
  <section
    class="simulation-parameters-panel"
    :style="{
      '--padding': padding + 'px',
      '--parameter-height': parameterHeight + 'px',
      '--parameter-input': parameterInput + '%',
      '--parameter-action': parameterAction + 'px',
    }"
  >
    <settings-bar>
      <counters
        slot="left"
        :title="countersTitle"
        :data="countersData"
      />
      <aside slot="right">
        <button
          class="btn btn-secondary"
          title="Fit Parameters"
          type="button"
          @click="onParameterValuesFitEvent()">
          <font-awesome-icon :icon="['fas', 'chart-line']" />
        </button>
        <button
          class="btn btn-secondary"
          title="Expand Parameters Panel"
          type="button"
          @click="$emit('expand')">
          <font-awesome-icon :icon="['fas', (expanded ? 'compress-alt' : 'expand-alt')]" />
        </button>
      </aside>
    </settings-bar>
    <div class="parameters" :class="{ message: someParametersAreInvalid}">
      <figure class="parameters-graph" ref="figure"><svg /></figure>

      <message-display v-if="noDisplayedParameters">
        Use the model visualization on the left or the
        <font-awesome-icon class="icon" :icon="['fas', 'plus']"/> and
        <font-awesome-icon class="icon" :icon="['fas', 'ban']"/>
        buttons above to add/remove <strong>parameters</strong>.
      </message-display>

      <ul v-else class="parameters-list">
        <li
          class="parameter"
          v-for="(parameter, index) of displayedParameters"
          :key="index"
          :class="{
            error: nonValidValue(parameterValues[parameter.uid]),
            highlighted: isHighlighted(parameter.uid),
            'domain_parameter': isDomainParameter(parameter),
          }"
          :title="parameter.metadata.Description"
        >
          <h4
          >{{ parameter.metadata.name }}</h4>
          <input
            type="text"
            v-model.number="parameterValues[parameter.uid]"
            :disabled="isDomainParameter(parameter)"
          />
          <aside class="btn-group">
            <!-- TODO: Allow users to select which parameters should be fitted
                 and which should be fixed -->
            <!-- <button
              class="btn btn-secondary btn-sm"
              title="Fit Parameter"
              type="button"
              @click="onSetParameterToBeFitted(parameter.uid)"
            >
              <font-awesome-icon :icon="['fas', parametersToFit.has(parameter.uid) ? 'ban' : 'chart-line']" />
            </button> -->
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

      <message-display v-if="someParametersAreInvalid && !noDisplayedParameters" messageType="danger">
        One or more <strong>parameters</strong> values are&nbsp;invalid.
      </message-display>
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
  import { scientificNotationSplitStr } from '@/utils/NumberUtil';
  import * as HMI from '@/types/types';
  import * as Model from '@/types/typesModel';
  import Counters from '@/components/Counters.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import MessageDisplay from '@/components/widgets/MessageDisplay.vue';
  // import { fitMeasures } from '@/services/DonuService';

  const components = {
    Counters,
    SettingsBar,
    MessageDisplay,
  };

  const SIMPLECHIME_UID_MAP = {
    'J:I_U': 'J:I_U_init',
    'J:I_V': 'J:I_V_init',
    'J:gamma': 'J:rec_u_rate',
    'J:inf_uu': 'J:inf_uu_rate',
    'J:inf_vv': 'J:inf_vv_rate',
    'J:inf_vu': 'J:inf_vu_rate',
    'J:inf_uv': 'J:inf_uv_rate',
    'J:R': 'J:R_init',
    'J:rec_u': 'J:rec_u_rate',
    'J:rec_v': 'J:rec_v_rate',
    'J:V': 'J:V_init',
    'J:S': 'J:S_init',
    'J:vax': 'J:vax_rate',
  };

  const SIMPLE_SIR_UID_MAP = {
    'J:beta': 'J:beta_rate',
    'J:gamma': 'J:gamma_rate',
    'J:S': 'J:S_init',
    'J:I': 'J:I_init',
    'J:R': 'J:R_init',
  };

  @Component({ components })
  export default class ParametersPanel extends Vue {
    @Prop({ default: false }) expanded: boolean;
    @Prop({ default: null }) modelId: number;
    @Prop({ default: null }) model: Model.Model;
    @Prop({ default: null }) highlighted: string;

    @InjectReactive() resized!: boolean;
    @InjectReactive() isResizing!: boolean;

    @Getter getSimModel;
    @Getter getSimParameterArray;
    @Getter getSelectedNodes;
    @Action setSimParameterValue;
    @Action hideParameter;

    private padding: number = 5;
    private parameterHeight: number = 75; // in pixels
    private parameterInput: number = 40; // in %
    private parameterAction: number = 35; // in pixels
    private parameterValues: { [uid: string]: number } = {};
    private someParametersAreInvalid: boolean = false;
    private parametersToFit: Set<string> = new Set();

    // Condition when to re/draw the Graph
    @Watch('resized') onResized (): void { this.resized && this.drawGraph(); }
    @Watch('expanded') onExpanded (): void { this.drawGraph(); }
    @Watch('displayedParameters') onDisplayedParametersChanged (): void { this.drawGraph(); }

    mounted (): void {
      this.onParametersChange();
      this.drawGraph();
    }

    // Condition when to clear the Graph
    @Watch('isResizing') onIsResising (): void { this.isResizing && this.clearGraph(); }

    @Watch('parameters') onParametersChange (): void {
      this.parameterValues = {};

      // If the parameterValues has no value for a parameter, we give the one in the store.
      // This is used to set default parameter values.
      this.parameters.forEach(parameter => {
        if (!Object.prototype.hasOwnProperty.call(this.parameterValues, parameter.uid)) {
          let currentValue = parameter.values[parameter.values.length - 1];

          // If the we have no default value and the parameter is a initial value,
          // set it up to 1 so the user can run the model right away.
          if (parameter.initial_condition && !currentValue) {
            currentValue = 1;
          }

          this.$set(this.parameterValues, parameter.uid, currentValue);
        }
      });
    }

    // Parameters values update
    @Watch('triggerParameterValues') onParameterValuesChange (): void {
      this.parameters.forEach(parameter => {
        const inputValue = this.parameterValues[parameter.uid];
        const currentValue = parameter.values[parameter.values.length - 1];

        if (inputValue !== currentValue) {
          this.setSimParameterValue({
            modelId: this.modelId,
            uid: parameter.uid,
            value: inputValue,
          });
        }
      });
      this.drawGraph();

      // Make sure that for every non domain parameters, their current value is valid.
      this.someParametersAreInvalid = this.parameters
        .filter(parameter => !this.isDomainParameter(parameter))
        .some(parameter => {
          const currentValue = parameter.values[parameter.values.length - 1];
          return this.nonValidValue(currentValue);
        });
      this.$emit('invalid', this.someParametersAreInvalid);
    }

    // Parameters values update
    async onParameterValuesFitEvent (): Promise<void> {
      const model = this.getSimModel(this.modelId);

      // Build model fit data payload
      const data = {
        values: {},
        times: [],
      };
      model.variables.forEach(v => {
        if (v.observed) {
          // NOTE: fitting measures is computationally expensive so we take only a sample of the observed data
          const numOfSamples = 4;
          const sampleDelta = Math.ceil(v.observed.length / numOfSamples);
          const times = [];
          const values = [];
          for (let i = 0; i < v.observed.length; i += sampleDelta) {
            const observed = v.observed[i];
            times.push(observed.x);
            values.push(observed.y);
          }
          data.values[v.uid] = values;
          data.times = times;
        }
      });
      // TODO: Fit Measures endpoint often crashes the service
      // I've commented it out for now in favour of a hard-coded
      // alternative
      // const fittedParameters = await fitMeasures(
      //   data,
      //   Array.from(this.parametersToFit),
      //   this.model.modelGraph[0].model,
      //   this.model.modelGraph[0].donuType,
      // );
      const fittedParameters = {
        'J:rec_rate': 0.05,
        'J:inf_rate': 0.4,
      };

      Object.entries(fittedParameters).forEach(([pid, value]) => {
        this.parameterValues[pid] = value;

        this.setSimParameterValue({
          modelId: this.modelId,
          uid: pid,
          value,
        });
      });
      this.drawGraph();

      // Make sure that for every non domain parameters, their current value is valid.
      this.someParametersAreInvalid = this.parameters
        .filter(parameter => !this.isDomainParameter(parameter))
        .some(parameter => {
          const currentValue = parameter.values[parameter.values.length - 1];
          return this.nonValidValue(currentValue);
        });
      this.$emit('invalid', this.someParametersAreInvalid);
    }

    onSetParameterToBeFitted (uid: string): void {
      // TODO: Modify this for multi-model view
      // may need to go in simulate vuex store
      this.parametersToFit.add(uid);
      this.drawGraph();
    }

    get triggerParameterValues (): string {
      return Object.values(this.parameterValues).join(',');
    }

    get parameters (): HMI.SimulationParameter[] {
      const parameters = this.getSimModel(this.modelId)?.parameters ?? [];
      // Order by ASC order
      return _.orderBy(parameters, ['metadata.name'], ['asc']);
    }

    get displayedParameters (): HMI.SimulationParameter[] {
      return this.parameters
        .filter(parameter => parameter.displayed)
        // Put the domain parameter at the end to have a concistent graph
        .sort(parameter => !this.isDomainParameter(parameter) ? -1 : 1);
    }

    get noDisplayedParameters (): boolean {
      return this.displayedParameters.length === 0;
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

    isHighlighted (uid: string): boolean {
      return this.getSelectedNodes(this.modelId).nodes.some(node => {
        if (this.modelId === 0) {
          return SIMPLECHIME_UID_MAP[node.id] === uid;
        } else if (this.modelId === 8) {
          return SIMPLE_SIR_UID_MAP[node.id] === uid;
        }
      });
    }

    graphHeight (): number {
      return this.displayedParameters.length * this.parameterHeight;
    }

    graphWidth (): number {
      const figure = this.$refs.figure as HTMLElement;
      return figure?.getBoundingClientRect().width ?? 0;
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
      const runs = this.getSimParameterArray(this.modelId);
      if (!runs) return;

      // Dimensions
      const axisLabelWidth = 40;
      const marginX = {
        // Input button + .parameter padding + axis label padding + axis label width
        left: ((this.parameterInput / 100 * this.graphWidth()) + (this.padding * 3) + axisLabelWidth),
        // Action button + .parameter padding + axis label padding + axis label width
        right: (this.parameterAction + (this.padding * 3) + axisLabelWidth),
      };
      const topPercentage = 0.45;
      const marginY = {
        // first .parameter: middle of the top half of the CSS grid
        // top: this.padding + this.parameterHeight * 0.25,
        top: this.padding + this.parameterHeight * topPercentage,
        // last .parameter: middle of the top half of the CSS grid
        // bottom: this.parameterHeight * 0.75 - this.padding,
        bottom: this.parameterHeight * (1 - topPercentage) - this.padding,
      };
      const xMinMax = [marginX.left, this.graphWidth() - marginX.right];
      const yMinMax = [marginY.top, this.graphHeight() - marginY.bottom];

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

      // Select the graph and size it
      this.clearGraph();
      const graph = d3.select(this.graphSelector);
      svgUtil.createChart(graph, this.graphWidth(), this.graphHeight());

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
              .attr('text-anchor', 'end')
              .attr('transform', svgUtil.translate(-this.padding, 3))
              .append('tspan')
                .html(d => scientificNotationSplitStr(xScales.get(d).min)[0])
              .append('tspan')
                .text(d => scientificNotationSplitStr(xScales.get(d).min)[1])
                .attr('dy', -5)
                .attr('font-size', 'smaller');

            // max label
            g.append('text')
              .attr('x', xMinMax[1])
              .attr('transform', svgUtil.translate(this.padding, 3))
              .append('tspan')
                .html(d => scientificNotationSplitStr(xScales.get(d).max)[0])
              .append('tspan')
                .text(d => scientificNotationSplitStr(xScales.get(d).max)[1])
                .attr('dy', -5)
                .attr('font-size', 'smaller');

            return g;
          });
    }

    nonValidValue (value: number): boolean {
      return !_.isNumber(value) || Number.isNaN(value);
    }

    /** A Domain Parameter is used in Functional Network as parameter of change,
     * this is the parameter that will be used to apply the Simulation steps.
     */
    isDomainParameter (parameter: HMI.SimulationParameter): boolean {
      return parameter.value_type === 'domain_parameter';
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
    overflow-x: hidden; /* Hide horizontal scrollbar */
    overflow-y: auto;
    position: relative;
    scroll-snap-points-y: repeat(var(--parameter-height));
    scroll-snap-destination: 0 0;
    scroll-snap-type: y mandatory;
    scroll-snap-type: mandatory;
  }

  .parameters .message-display {
    margin: 1em;
    position: sticky;
    top: 1em;
  }

  .parameters.message {
    --parameter-margin-top: 7em;
  }

  .parameters-graph,
  .parameters-list {
    bottom: 0;
    left: 0;
    margin: 0;
    position: absolute;
    right: 0;
    top: var(--parameter-margin-top, 0);
  }

  .parameters-list {
    list-style: none;
    padding: 0;
  }

  .parameter {
    border: 1px solid transparent;
    display: grid;
    grid-template-areas:
      "name axis action"
      "value . action"
    ;
    grid-template-columns: var(--parameter-input) auto var(--parameter-action);
    grid-template-rows: 1fr 1fr;
    height: var(--parameter-height);
    padding: var(--padding);
    position: relative;
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
    overflow: hidden;
    text-overflow: ellipsis;
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
  }

  .parameter .btn-group {
    grid-area: action;
    display: flex;
    align-items: center;
  }

  .parameter .btn-group button {
    padding-bottom: 0;
    padding-top: 0;
    height: 35px;
  }

  .parameter.highlighted {
    border-color: var(--selection);
  }

  /* Domain Parameter */
  .parameter.domain_parameter::after {
    content: 'Domain Parameter: ' attr(title);
    font-weight: bold;
    left: 50%;
    overflow: hidden;
    position: absolute;
    text-align: center;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 75%;
  }

  .parameter.domain_parameter::before {
    background: var(--bg-graphs);
    bottom: 0;
    content: '\0A';
    left: 0;
    opacity: .6;
    position: absolute;
    right: 0;
    top: 0;
  }

  /* Error */
  .parameter:not(.domain_parameter).error {
    border-color: var(--error);
  }

  .parameter:not(.domain_parameter).error input {
    background-color: var(--error);
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

  .parameters-graph .run {
    fill: none;
    stroke: var(--colours-nodes-other);
    stroke-width: 3;
  }

  .parameters-graph .run.current {
    stroke: var(--colours-nodes-default);
  }
</style>
