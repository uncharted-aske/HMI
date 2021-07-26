import { ActionTree, GetterTree, MutationTree } from 'vuex';
import * as HMI from '@/types/types';
import * as Model from '@/types/typesModel';
import { getModelParameters, getModelResult, getModelVariables } from '@/services/DonuService';
import * as d3 from 'd3';

type SimulationModel = {
  id: number,
  parameters: HMI.SimulationParameter[],
  variables: HMI.SimulationVariable[],
}

type SimulationState = {
  numberOfSavedRuns: number,
  models: SimulationModel[],
}

const state: SimulationState = {
  numberOfSavedRuns: 0,
  models: [],
};

const currentNumberOfRuns = (state: SimulationState): number => {
  return state.models[0]?.parameters?.[0]?.values.length ?? 0;
};

const getModel = (state: SimulationState, modelId: number): SimulationModel => {
  let model = state.models.find(model => model.id === modelId);
  if (!model) {
    model = { id: modelId, parameters: [], variables: [] };
    state.models.push(model);
  }
  return model;
};

const getParameter = (state: SimulationState, modelId: number, selector: string): HMI.SimulationParameter => {
  return getModel(state, modelId)?.parameters.find(parameter => {
    return [parameter.uid, parameter.metadata.name].includes(selector);
  });
};

const getVariable = (state: SimulationState, modelId: number, selector: string): HMI.SimulationVariable => {
  return getModel(state, modelId)?.variables.find(variable => {
    return [variable.uid, variable.metadata.name].includes(selector);
  });
};

const getters: GetterTree<any, HMI.SimulationParameter[]> = {
  getSimModels (state: SimulationState) { return state.models; },

  getSimModel (state: SimulationState) {
    return (modelId: number): SimulationModel => getModel(state, modelId);
  },

  getSimParameters (state: SimulationState): { [modelId: number]: HMI.SimulationParameter[] } {
    const parameters = {};
    for (const modelId in state.models) {
      parameters[modelId] = state.models[modelId]?.parameters ?? [];
    }
    return parameters;
  },

  getRunsCount (state: SimulationState): number {
    return currentNumberOfRuns(state);
  },

  getSimParameterArray (state: SimulationState): { [modelId: number]: any } {
    const simParameterArray = {};
    for (const modelId in state.models) {
      const RunsCount = currentNumberOfRuns(state);
      const output = new Array(RunsCount);
      for (let i = 0; i < RunsCount; i++) {
        output[i] = state.models[modelId]?.parameters.reduce((obj, parameter) => {
          obj[parameter.uid] = parameter.values[i];
          return obj;
        }, {});
      }
      simParameterArray[modelId] = output;
    }
    return simParameterArray;
  },

  getSimVariables (state: SimulationState): { [modelId: number]: HMI.SimulationVariable[] } {
    const variables = {};
    for (const modelId in state.models) {
      variables[modelId] = state.models[modelId]?.variables ?? [];
    }
    return variables;
  },

  getVariablesRunsCount (state): number {
    return state.models[0]?.variables?.[0]?.values?.length ?? 0;
  },
};

const actions: ActionTree<SimulationState, HMI.SimulationParameter[]> = {
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
      parameters = state.models[args.modelId]?.parameters.map(parameter => {
        const currentParamsCount = parameter.values.length;
        parameter.values[currentParamsCount] = parameter.values[currentParamsCount - 1];
        return parameter;
      });
    } else {
      parameters = state.models[args.modelId]?.parameters.map(parameter => {
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
    for (const param of getters.getSimParameterArray?.[model.id]) {
      const response = await getModelResult(model, param, config, selectedModelGraphType);
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

  hideParameter ({ commit, getters }, args: { modelId: number, selector: string }): void {
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

const mutations: MutationTree<SimulationState> = {
  setModels (state: SimulationState, models): void {
    state.models = models ?? [];
  },

  setSimParameters (state: SimulationState, args : {
    modelId: number,
    parameters: HMI.SimulationParameter[],
  }): void {
    getModel(state, args.modelId).parameters = args.parameters;
  },

  setSimVariables (state: SimulationState, args : {
    modelId: number,
    variables: HMI.SimulationVariable[],
  }): void {
    getModel(state, args.modelId).variables = args.variables;
  },

  updateParameterValues (state: SimulationState, args: {
    modelId: number,
    selector: string,
    value: number,
  }): void {
    const parameter = getParameter(state, args.modelId, args.selector);
    if (parameter) {
      parameter.values.push(args.value);
    }
  },

  updateVariableValues (state: SimulationState, args: {
    modelId: number,
    uid: string,
    values: HMI.SimulationVariableValues,
  }): void {
    const variable = getVariable(state, args.modelId, args.uid);
    if (variable) {
      variable.values.push(args.values);
    }
  },

  resetVariablesValues (state: SimulationState, modelId: number): void {
    state.models[modelId]?.variables.forEach(variable => {
      variable.values = [];
      variable.aggregate = null;
    });
  },

  setNumberOfSavedRuns (state: SimulationState, count: number): void {
    state.numberOfSavedRuns = count;
  },

  setVariablesAggregate (state: SimulationState, args: {
    aggregator: Function, /* eslint-disable-line @typescript-eslint/ban-types */
    modelId: number,
  }): void {
    if (!args.aggregator) args.aggregator = d3.mean;
    state.models[args.modelId]?.variables.forEach(variable => {
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

  setParameterVisibility (state: SimulationState, args: {
    modelId: number,
    uid: string,
    visibility: boolean,
  }): void {
    const parameter = state.models[args.modelId]?.parameters.find(parameter => parameter.uid === args.uid);
    parameter.edited = args.visibility;
  },

  setAllParametersVisibility (state: SimulationState, args: {
    modelId: number,
    visibility: boolean,
  }): void {
    state.models[args.modelId]?.parameters.forEach(parameter => { parameter.edited = args.visibility; });
  },

  setVariableVisibility (state: SimulationState, args: {
    modelId: number,
    uid: string,
    visibility: boolean,
  }): void {
    const variable = state.models[args.modelId]?.variables.find(variable => variable.uid === args.uid);
    variable.edited = args.visibility;
  },

  setAllVariablesVisibility (state: SimulationState, args: {
    modelId: number,
    visibility: boolean,
  }): void {
    state.models[args.modelId]?.variables.forEach(variable => { variable.edited = args.visibility; });
  },
};

export {
  state,
  actions,
  getters,
  mutations,
};
