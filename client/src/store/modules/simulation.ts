import { ActionTree, GetterTree, MutationTree } from 'vuex';
import * as HMI from '@/types/types';
import * as Model from '@/types/typesModel';
import { getModelParameters, getModelResult, getModelVariables } from '@/services/DonuService';
import * as d3 from 'd3';

type SimulationState = {
  numberOfSavedRuns: number,
  parameters: HMI.SimulationParameter[],
  variables: HMI.SimulationVariable[],
}

const state: SimulationState = {
  numberOfSavedRuns: 0,
  parameters: [],
  variables: [],
};

const currentNumberOfRuns = (state: SimulationState): number => {
  return state.parameters?.[0]?.values.length ?? 0;
};

const getters: GetterTree<any, HMI.SimulationParameter[]> = {
  getSimParameters (state: SimulationState): HMI.SimulationParameter[] {
    return state.parameters;
  },

  getRunsCount (state: SimulationState): number {
    return currentNumberOfRuns(state);
  },

  getSimParameterArray (state: SimulationState): any {
    const RunsCount = currentNumberOfRuns(state);
    const output = new Array(RunsCount);
    for (let i = 0; i < RunsCount; i++) {
      output[i] = state.parameters.reduce((obj, parameter) => {
        obj[parameter.uid] = parameter.values[i];
        return obj;
      }, {});
    }
    return output;
  },

  getSimVariables (state: SimulationState): HMI.SimulationVariable[] {
    return state.variables;
  },

  getVariablesRunsCount (state): number {
    return state.variables?.[0]?.values?.length;
  },
};

const actions: ActionTree<SimulationState, HMI.SimulationParameter[]> = {
  setSimParameters ({ state, commit }, args: { parameters: HMI.SimulationParameter[], count: number }): void {
    commit('setSimParameters', args.parameters);
    commit('setNumberOfSavedRuns', args.count ?? currentNumberOfRuns(state));
  },

  setSimParameterValue ({ state, commit }, args: { uid: string, value: number }): void {
    let parameters = [] as HMI.SimulationParameter[];

    if (currentNumberOfRuns(state) < state.numberOfSavedRuns) {
      parameters = state.parameters.map(parameter => {
        const currentParamsCount = parameter.values.length;
        parameter.values[currentParamsCount] = parameter.values[currentParamsCount - 1];
        return parameter;
      });
    } else {
      parameters = state.parameters.map(parameter => {
        if (parameter.uid === args.uid) {
          parameter.values[parameter.values.length - 1] = args.value;
        }
        return parameter;
      });
    }

    commit('setSimParameters', parameters);
  },

  incrNumberOfSavedRuns ({ state, commit }): void {
    commit('setNumberOfSavedRuns', state.numberOfSavedRuns + 1);
  },

  setSimVariablesVisibility ({ state, commit }, args: boolean): void {
    const variables = state.variables.map(variable => {
      variable.hidden = Boolean(args);
      return variable;
    });
    commit('setSimVariables', variables);
  },

  setSimVariableVisibility ({ state, commit }, args: string): void {
    const variables = state.variables.map(variable => {
      if (variable.metadata.name === args) {
        variable.hidden = !variable.hidden;
      }
      return variable;
    });
    commit('setSimVariables', variables);
  },

  async fetchModelResults ({ getters, commit }, { model, config, aggregator, selectedModelGraph }): Promise<void> {
    commit('resetVariablesValues');

    // For each run of the model, fetch the results...
    for (const param of getters.getSimParameterArray) {
      const response = await getModelResult(model, param, config, selectedModelGraph);

      // The reponse.values is a list of variables results with the variable uid as key.
      // Each index of the result list correspond to the response.times list.
      for (const uid in response.values) {
        const args = {
          uid: uid,
          values: response.values[uid].map((value, index) => ({ x: response.times[index], y: value })),
        };
        commit('updateVariableValues', args);
      }
    }

    // ...and aggregate them
    commit('setVariablesAggregate', aggregator);
  },

  async initializeSimParameters ({ commit }, model: Model.Model, selectedModelGraph: number = 0): Promise<void> {
    const donuParameters = await getModelParameters(model, selectedModelGraph) ?? [];
    const parameters = donuParameters.map(donuParameter => ({
      ...donuParameter,
      edited: false,
      hidden: false,
      values: [donuParameter.default],
    }));
    commit('setSimParameters', parameters);
    commit('setNumberOfSavedRuns', 1);
  },

  async initializeSimVariables ({ commit }, model: Model.Model, selectedModelGraph: number = 0): Promise<void> {
    const donuVariables = await getModelVariables(model, selectedModelGraph) ?? [];
    const variables = donuVariables.map(donuVariable => ({
      ...donuVariable,
      aggregate: null,
      hidden: false,
      values: [],
    }));
    commit('setSimVariables', variables);
  },

  resetSim ({ commit }): void {
    commit('setNumberOfSavedRuns', 0);
    commit('setParameters', []);
    commit('setVariables', []);
    commit('setVariablesAggregate');
  },
};

const mutations: MutationTree<SimulationState> = {
  setSimParameters (state, parameters: HMI.SimulationParameter[]): void {
    state.parameters = parameters;
  },

  setSimVariables (state, variables: HMI.SimulationVariable[]): void {
    state.variables = variables;
  },

  updateVariableValues (state, args: { uid: string, values: HMI.SimulationVariableValues }): void {
    const variable = state.variables.find(variable => {
      return [variable.uid, variable.metadata.name].includes(args.uid);
    });

    if (variable) {
      variable.values.push(args.values);
    }
  },

  resetVariablesValues (state): void {
    state.variables.forEach(variable => {
      variable.values = [];
      variable.aggregate = null;
    });
  },

  setNumberOfSavedRuns (state, count: number): void {
    state.numberOfSavedRuns = count;
  },

  setVariablesAggregate (state, aggregator: Function = d3.mean): void { /* eslint-disable-line @typescript-eslint/ban-types */
    state.variables.forEach(variable => {
      // No saved runs, no need to aggregate
      if (state.numberOfSavedRuns < 2) {
        variable.aggregate = null;
        return;
      }

      // A variable.values are a list of runs each containing
      // a list of {x: step, y: value} for each step.
      const valuesOfAllRunsPerStep = {};
      for (let run = 0; run < state.numberOfSavedRuns; run++) {
        for (let step = 0; step < variable.values[run].length; step++) {
          const { x, y } = variable.values[run][step];

          if (!valuesOfAllRunsPerStep[x]) {
            valuesOfAllRunsPerStep[x] = [y];
          } else {
            valuesOfAllRunsPerStep[x].push(y);
          }
        }
      }

      // Aggregate the values in a single list (to emulate a run.)
      const aggregate = [];
      for (const x in valuesOfAllRunsPerStep) {
        aggregate.push({
          x: Number(x),
          y: aggregator(valuesOfAllRunsPerStep[x]),
        });
      }

      // We only assign now the variable.aggregate to avoid Vue reactivity.
      variable.aggregate = aggregate;
    });
  },
};

export {
  state,
  actions,
  getters,
  mutations,
};
