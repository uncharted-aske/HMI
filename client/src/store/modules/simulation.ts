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

const getParameter = (state: SimulationState, selector: string): HMI.SimulationParameter => {
  return state.parameters.find(parameter => {
    return [parameter.uid, parameter.metadata.name].includes(selector);
  });
};

const getVariable = (state: SimulationState, selector: string): HMI.SimulationVariable => {
  return state.variables.find(variable => {
    return [variable.uid, variable.metadata.name].includes(selector);
  });
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

  async fetchModelResults ({ getters, commit }, { model, config, aggregator, selectedModelGraphType }): Promise<void> {
    commit('resetVariablesValues');

    // For each run of the model, fetch the results...
    for (const param of getters.getSimParameterArray) {
      const response = await getModelResult(model, param, config, selectedModelGraphType);
      // The reponse.values is a list of variables results with the variable uid as key.
      // Each index of the result list correspond to the response.times list.
      for (const uid in response[0].values) {
        const args = {
          uid: uid,
          values: response[0].values[uid].map((value, index) => ({ x: response[0].times[index], y: value })),
        };
        commit('updateVariableValues', args);
      }
    }

    // ...and aggregate them
    commit('setVariablesAggregate', aggregator);
  },

  async initializeParameters ({ commit }, args: { model: Model.Model, selectedModelGraphType: Model.GraphTypes }): Promise<void> {
    const donuParameters = await getModelParameters(args.model, args.selectedModelGraphType) ?? [];
    const parameters = donuParameters.map(donuParameter => ({
      ...donuParameter,
      edited: false,
      hidden: false,
      values: [donuParameter.default],
    }));
    commit('setSimParameters', parameters);
    commit('setNumberOfSavedRuns', 1);
  },

  async initializeVariables ({ commit }, args: { model: Model.Model, selectedModelGraphType: Model.GraphTypes }): Promise<void> {
    const donuVariables = await getModelVariables(args.model, args.selectedModelGraphType) ?? [];
    const variables = donuVariables.map(donuVariable => ({
      ...donuVariable,
      aggregate: null,
      edited: false,
      hidden: false,
      values: [],
    }));
    commit('setSimVariables', variables);
  },

  hideAllParameters ({ commit }): void { commit('setAllParametersVisibility', false); },
  showAllParameters ({ commit }): void { commit('setAllParametersVisibility', true); },
  hideAllVariables ({ commit }): void { commit('setAllVariablesVisibility', false); },
  showAllVariables ({ commit }): void { commit('setAllVariablesVisibility', true); },

  hideParameter ({ commit }, selector: string): void {
    const parameter = getParameter(state, selector);
    if (parameter) {
      const args = { uid: parameter.uid, visibility: false };
      commit('setParameterVisibility', args);
    }
  },
  showParameter ({ commit }, selector: string): void {
    const parameter = getParameter(state, selector);
    if (parameter) {
      const args = { uid: parameter.uid, visibility: true };
      commit('setParameterVisibility', args);
    }
  },
  toggleParameter ({ state, commit }, selector: string): void {
    const parameter = getParameter(state, selector);
    if (parameter) {
      const args = { uid: parameter.uid, visibility: !parameter.edited };
      commit('setParameterVisibility', args);
    }
  },

  hideVariable ({ commit }, selector: string): void {
    const variable = getVariable(state, selector);
    if (variable) {
      const args = { uid: variable.uid, visibility: false };
      commit('setVariableVisibility', args);
    }
  },
  showVariable ({ commit }, selector: string): void {
    const variable = getVariable(state, selector);
    if (variable) {
      const args = { uid: variable.uid, visibility: true };
      commit('setVariableVisibility', args);
    }
  },
  toggleVariable ({ state, commit }, selector: string): void {
    const variable = getVariable(state, selector);
    if (variable) {
      const args = { uid: variable.uid, visibility: !variable.edited };
      commit('setVariableVisibility', args);
    }
  },

  resetSim ({ commit }): void {
    commit('setNumberOfSavedRuns', 0);
    commit('setSimParameters', []);
    commit('setSimVariables', []);
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

  updateParameterValues (state, args: { selector: string, value: number }): void {
    const parameter = getParameter(state, args.selector);
    if (parameter) {
      parameter.values.push(args.value);
    }
  },

  updateVariableValues (state, args: { uid: string, values: HMI.SimulationVariableValues }): void {
    const variable = getVariable(state, args.uid);
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
      if (state.numberOfSavedRuns < 3) {
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

  setParameterVisibility (state, args: { uid: string, visibility: boolean }): void {
    const parameter = state.parameters.find(parameter => parameter.uid === args.uid);
    parameter.edited = args.visibility;
  },

  setAllParametersVisibility (state, visibility: boolean): void {
    state.parameters.forEach(parameter => { parameter.edited = visibility; });
  },

  setVariableVisibility (state, args: { uid: string, visibility: boolean }): void {
    const variable = state.variables.find(variable => variable.uid === args.uid);
    variable.edited = args.visibility;
  },

  setAllVariablesVisibility (state, visibility: boolean): void {
    state.variables.forEach(variable => { variable.edited = visibility; });
  },
};

export {
  state,
  actions,
  getters,
  mutations,
};
