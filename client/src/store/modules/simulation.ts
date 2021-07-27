import { ActionTree, GetterTree, MutationTree } from 'vuex';
import * as HMI from '@/types/types';
import * as Model from '@/types/typesModel';
import { getModelParameters, getModelResult, getModelVariables } from '@/services/DonuService';
import * as d3 from 'd3';

const state: HMI.SimulationState = {
  numberOfSavedRuns: 0,
  models: [],
};

const currentNumberOfRuns = (state: HMI.SimulationState): number => {
  // The number of runs is identical for all parameters, we select
  // the first model for simplicity, but any `modelId` will work.
  return state.models[0]?.parameters?.[0]?.values.length ?? 0;
};

const getModel = (state: HMI.SimulationState, modelId: number): HMI.SimulationModel => {
  let model = state.models.find(model => model.id === modelId);
  if (!model) {
    model = { id: modelId, parameters: [], variables: [] };
    state.models.push(model);
  }
  return model;
};

const getParameter = (state: HMI.SimulationState, modelId: number, selector: string): HMI.SimulationParameter => {
  return getModel(state, modelId)?.parameters.find(parameter => {
    return [parameter.uid, parameter.metadata.name].includes(selector);
  });
};

const getVariable = (state: HMI.SimulationState, modelId: number, selector: string): HMI.SimulationVariable => {
  return getModel(state, modelId)?.variables.find(variable => {
    return [variable.uid, variable.metadata.name].includes(selector);
  });
};

const getters: GetterTree<any, HMI.SimulationParameter[]> = {
  getSimModels (state: HMI.SimulationState) { return state.models; },

  getSimModel (state: HMI.SimulationState) {
    return (modelId: number): HMI.SimulationModel => getModel(state, modelId);
  },

  getRunsCount (state: HMI.SimulationState): number {
    return currentNumberOfRuns(state);
  },

  getSimParameterArray (state: HMI.SimulationState) {
    return (modelId: number): any => {
      const parameters = getModel(state, modelId).parameters;
      const runsCount = currentNumberOfRuns(state);
      const output = new Array(runsCount);
      for (let i = 0; i < runsCount; i++) {
        output[i] = parameters.reduce((obj, parameter) => {
          obj[parameter.uid] = parameter.values[i];
          return obj;
        }, {});
      }
      return output;
    };
  },

  getVariablesRunsCount (state): number {
    // The number of runs is identical for all variables, we select
    // the first model for simplicity, but any `modelId` will work.
    return state.models[0]?.variables?.[0]?.values?.length ?? 0;
  },
};

const actions: ActionTree<HMI.SimulationState, HMI.SimulationParameter[]> = {
  setSimParameters ({ state, commit }, args: {
    count: number,
    modelId: number,
    parameters: HMI.SimulationParameter[],
  }): void {
    const { modelId, parameters } = args;
    commit('setSimParameters', { modelId, parameters });
    commit('setNumberOfSavedRuns', args.count ?? currentNumberOfRuns(state));
  },

  setSimParameterValue ({ state, commit }, args: {
    modelId: number,
    uid: string,
    value: number,
  }): void {
    let parameters = [] as HMI.SimulationParameter[];

    if (currentNumberOfRuns(state) < state.numberOfSavedRuns) {
      parameters = getModel(state, args.modelId).parameters.map(parameter => {
        const currentParamsCount = parameter.values.length;
        parameter.values[currentParamsCount] = parameter.values[currentParamsCount - 1];
        return parameter;
      });
    } else {
      parameters = getModel(state, args.modelId).parameters.map(parameter => {
        if (parameter.uid === args.uid) {
          parameter.values[parameter.values.length - 1] = args.value;
        }
        return parameter;
      });
    }

    commit('setSimParameters', { modelId: args.modelId, parameters });
  },

  incrNumberOfSavedRuns ({ state, commit }): void {
    commit('setNumberOfSavedRuns', state.numberOfSavedRuns + 1);
  },

  async fetchModelResults ({ getters, commit }, { model, config, aggregator, selectedModelGraphType }): Promise<void> {
    commit('resetVariablesValues', model.id);

    // For each run of the model, fetch the results...
    for (const params of getters.getSimParameterArray(model.id)) {
      const response = await getModelResult(model, params, config, selectedModelGraphType);
      // The reponse.values is a list of variables results with the variable uid as key.
      // Each index of the result list correspond to the response.times list.
      for (const uid in response[0].values) {
        const args = {
          modelId: model.id,
          uid: uid,
          values: response[0].values[uid].map((value, index) => ({ x: response[0].times[index], y: value })),
        };
        commit('updateVariableValues', args);
      }
    }

    // ...and aggregate them
    commit('setVariablesAggregate', { aggregator, modelId: model.id });
  },

  async initializeParameters ({ commit }, args: { model: Model.Model, selectedModelGraphType: Model.GraphTypes }): Promise<void> {
    const donuParameters = await getModelParameters(args.model, args.selectedModelGraphType) ?? [];
    const parameters = donuParameters.map(donuParameter => ({
      ...donuParameter,
      edited: false,
      hidden: false,
      values: [donuParameter.default],
    }));
    commit('setSimParameters', { modelId: args.model.id, parameters });
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
    commit('setSimVariables', { modelId: args.model.id, variables });
  },

  hideAllParameters ({ commit }, modelId: number): void {
    commit('setAllParametersVisibility', { modelId, visibility: false });
  },
  showAllParameters ({ commit }, modelId: number): void {
    commit('setAllParametersVisibility', { modelId, visibility: true });
  },

  hideAllVariables ({ commit }, modelId: number): void {
    commit('setAllVariablesVisibility', { modelId, visibility: false });
  },
  showAllVariables ({ commit }, modelId: number): void {
    commit('setAllVariablesVisibility', { modelId, visibility: true });
  },

  hideParameter ({ commit }, args: { modelId: number, selector: string }): void {
    const parameter = getParameter(state, args.modelId, args.selector);
    if (parameter) {
      commit('setParameterVisibility', { modelId: args.modelId, uid: parameter.uid, visibility: false });
    }
  },
  showParameter ({ commit }, args: { modelId: number, selector: string }): void {
    const parameter = getParameter(state, args.modelId, args.selector);
    if (parameter) {
      commit('setParameterVisibility', { modelId: args.modelId, uid: parameter.uid, visibility: true });
    }
  },
  toggleParameter ({ state, commit }, args: { modelId: number, selector: string }): void {
    const parameter = getParameter(state, args.modelId, args.selector);
    if (parameter) {
      commit('setParameterVisibility', { modelId: args.modelId, uid: parameter.uid, visibility: !parameter.edited });
    }
  },

  hideVariable ({ commit }, args: { modelId: number, selector: string }): void {
    const variable = getVariable(state, args.modelId, args.selector);
    if (variable) {
      commit('setVariableVisibility', { modelId: args.modelId, uid: variable.uid, visibility: false });
    }
  },
  showVariable ({ commit }, args: { modelId: number, selector: string }): void {
    const variable = getVariable(state, args.modelId, args.selector);
    if (variable) {
      commit('setVariableVisibility', { modelId: args.modelId, uid: variable.uid, visibility: true });
    }
  },
  toggleVariable ({ state, commit }, args: { modelId: number, selector: string }): void {
    const variable = getVariable(state, args.modelId, args.selector);
    if (variable) {
      commit('setVariableVisibility', { modelId: args.modelId, uid: variable.uid, visibility: !variable.edited });
    }
  },

  resetSim ({ commit }): void {
    commit('setNumberOfSavedRuns', 0);
    commit('setModels', []);
  },
};

const mutations: MutationTree<HMI.SimulationState> = {
  setModels (state: HMI.SimulationState, models): void {
    state.models = models ?? [];
  },

  setSimParameters (state: HMI.SimulationState, args : {
    modelId: number,
    parameters: HMI.SimulationParameter[],
  }): void {
    getModel(state, args.modelId).parameters = args.parameters;
  },

  setSimVariables (state: HMI.SimulationState, args : {
    modelId: number,
    variables: HMI.SimulationVariable[],
  }): void {
    getModel(state, args.modelId).variables = args.variables;
  },

  updateParameterValues (state: HMI.SimulationState, args: {
    modelId: number,
    selector: string,
    value: number,
  }): void {
    const parameter = getParameter(state, args.modelId, args.selector);
    if (parameter) {
      parameter.values.push(args.value);
    }
  },

  updateVariableValues (state: HMI.SimulationState, args: {
    modelId: number,
    uid: string,
    values: HMI.SimulationVariableValues,
  }): void {
    const variable = getVariable(state, args.modelId, args.uid);
    if (variable) {
      variable.values.push(args.values);
    }
  },

  resetVariablesValues (state: HMI.SimulationState, modelId: number): void {
    getModel(state, modelId).variables.forEach(variable => {
      variable.values = [];
      variable.aggregate = null;
    });
  },

  setNumberOfSavedRuns (state: HMI.SimulationState, count: number): void {
    state.numberOfSavedRuns = count;
  },

  setVariablesAggregate (state: HMI.SimulationState, args: {
    aggregator: Function, /* eslint-disable-line @typescript-eslint/ban-types */
    modelId: number,
  }): void {
    if (!args.aggregator) args.aggregator = d3.mean;
    getModel(state, args.modelId).variables.forEach(variable => {
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
          y: args.aggregator(valuesOfAllRunsPerStep[x]),
        });
      }

      // We only assign now the variable.aggregate to avoid Vue reactivity.
      variable.aggregate = aggregate;
    });
  },

  setParameterVisibility (state: HMI.SimulationState, args: {
    modelId: number,
    uid: string,
    visibility: boolean,
  }): void {
    const parameter = getParameter(state, args.modelId, args.uid);
    parameter.edited = args.visibility;
  },

  setAllParametersVisibility (state: HMI.SimulationState, args: {
    modelId: number,
    visibility: boolean,
  }): void {
    getModel(state, args.modelId).parameters.forEach(parameter => {
      parameter.edited = args.visibility;
    });
  },

  setVariableVisibility (state: HMI.SimulationState, args: {
    modelId: number,
    uid: string,
    visibility: boolean,
  }): void {
    const variable = getVariable(state, args.modelId, args.uid);
    variable.edited = args.visibility;
  },

  setAllVariablesVisibility (state: HMI.SimulationState, args: {
    modelId: number,
    visibility: boolean,
  }): void {
    getModel(state, args.modelId).variables.forEach(variable => {
      variable.edited = args.visibility;
    });
  },
};

export {
  state,
  actions,
  getters,
  mutations,
};
