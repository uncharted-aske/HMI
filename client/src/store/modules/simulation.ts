import { ActionTree, GetterTree, MutationTree } from 'vuex';
import * as HMI from '@/types/types';
import * as Model from '@/types/typesModel';
import * as Donu from '@/types/typesDonu';
import { getDatasetResult, getModelInterface, getModelResult, getSimulationError } from '@/services/DonuService';
import * as d3 from 'd3';
import _ from 'lodash';

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
    model = {
      id: modelId,
      initialised: false,
      parameters: [],
      variables: [],
    };
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

/** Test to know if a parameter is an initial condition based on Galois' information */
const isInitialCondition = (parameter: Donu.ModelParameter): boolean => {
  return parameter.metadata.group === 'Initial State' || parameter.uid.includes('_init');
};

const getters: GetterTree<any, HMI.SimulationParameter[]> = {
  getSimModel (state: HMI.SimulationState) {
    return (modelId: number): HMI.SimulationModel => getModel(state, modelId);
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
  setVariableObservedId ({ commit }, args: {
    modelId: number,
    uid: string,
    observedId: string,
  }): void {
    commit('setVariableObservedId', args);
  },

  setSimParameterValue ({ commit }, args: {
    modelId: number,
    uid: string,
    value: number,
  }): void {
    commit('updateParameterValues', {
      modelId: args.modelId,
      selector: args.uid,
      value: args.value,
    });
  },

  incrNumberOfSavedRuns ({ state, commit }): void {
    state.models.forEach(model => {
      const parameters = model.parameters.map(parameter => {
        parameter.values.push(parameter.values[state.numberOfSavedRuns]);
        return parameter;
      });
      commit('setSimParameters', { modelId: model.id, parameters });
    });
    commit('setNumberOfSavedRuns', state.numberOfSavedRuns + 1);
  },

  async fetchModelResults ({ getters, commit }, { model, config, aggregator, selectedModelGraphType }): Promise<void> {
    commit('resetVariablesValues', model.id);

    // For each run of the model, fetch the results...
    const responseArr = await Promise.all(
      getters.getSimParameterArray(model.id).map(param => getModelResult(model, param, config, selectedModelGraphType)),
    );

    // The property in which the xAxis values are stored depends on the Graph Type. c.f. types/typesDonu.ts
    const xAxis = selectedModelGraphType === Model.GraphTypes.FunctionNetwork ? 'domain_parameter' : 'times';

    for (const response of responseArr) {
      // The reponse.values is a list of variables results with the variable uid as key.
      // Each index of the result list correspond to the response.times list.
      for (const uid in response[0].values) {
        const values = response[0].values[uid].map((value, index) => ({ x: response[0][xAxis][index], y: value }));
        commit('updateVariableValues', { modelId: model.id, uid: uid, values });
      }
    }

    // ...and aggregate them
    commit('setVariablesAggregate', { aggregator, modelId: model.id });
  },

  async initializeInterface ({ state, commit }, args: { model: Model.Model, selectedModelGraphType: Model.GraphTypes }): Promise<void> {
    // Check if the model interface has already been initialised.
    if (getModel(state, args.model.id).initialised) return;

    const {
      parameters: donuParameters,
      measures: donuVariables,
    } = await getModelInterface(args.model, args.selectedModelGraphType) ?? {} as Donu.ModelDefinition;

    if (donuParameters) {
      // Filter out parameters with the same not so unique UID.
      const uniqueParameters = _.uniqBy(donuParameters, 'uid');

      const parameters = uniqueParameters.map(donuParameter => {
        const parameter = {
          ...donuParameter,
          displayed: false,
          values: [donuParameter.default],
          initial_condition: isInitialCondition(donuParameter),
        } as HMI.SimulationParameter;

        // If the API does not provide a name, we leverage the UID.
        if (!parameter.metadata.name) {
          parameter.metadata.name = parameter.uid;
        }

        return parameter;
      });
      commit('setSimParameters', { modelId: args.model.id, parameters });
    }

    if (donuVariables) {
      const variables = donuVariables.map(donuVariable => {
        const variable = {
          ...donuVariable,
          aggregate: null,
          displayed: false,
          values: [],
        };

        // If the API does not provide a name, we leverage the UID.
        if (!variable.metadata.name) {
          variable.metadata.name = variable.uid;
        }

        return variable;
      });
      commit('setSimVariables', { modelId: args.model.id, variables });
    }

    commit('setModelIsInitialised', args.model.id);
    commit('setNumberOfSavedRuns', 0);
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
  toggleParameter ({ state, commit }, args: { modelId: number, selector: string }): void {
    const parameter = getParameter(state, args.modelId, args.selector);
    if (parameter) {
      commit('setParameterVisibility', { modelId: args.modelId, uid: parameter.uid, visibility: !parameter.displayed });
    }
  },

  hideVariable ({ commit }, args: { modelId: number, selector: string }): void {
    const variable = getVariable(state, args.modelId, args.selector);
    if (variable) {
      commit('setVariableVisibility', { modelId: args.modelId, uid: variable.uid, visibility: false });
    }
  },
  toggleVariable ({ state, commit }, args: { modelId: number, selector: string }): void {
    const variable = getVariable(state, args.modelId, args.selector);
    if (variable) {
      commit('setVariableVisibility', { modelId: args.modelId, uid: variable.uid, visibility: !variable.displayed });
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

  setModelIsInitialised (state: HMI.SimulationState, modelId): void {
    getModel(state, modelId).initialised = true;
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
      // Replace last value, using pop/push for reactivity.
      parameter.values.pop();
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

  async setVariableObservedId (state: HMI.SimulationState, args: {
    modelId: number,
    uid: string,
    observedId: string,
  }): Promise<void> {
    const variable = getVariable(state, args.modelId, args.uid);
    variable.observedId = args.observedId;

    // Build measures array for error calculation
    const allowedTimeColumnNames = ['date', 'time', 'Day', 'week', 'month', 'year'];
    const measures: Donu.Measure[] = [];
    const model = getModel(state, args.modelId);
    for (const variable of model.variables) {
      const observedId = variable.observedId;
      if (observedId) {
        const currentRunVariableValues = variable.values[variable.values.length - 1];
        const currentRunVariableValuesLen = currentRunVariableValues.length;

        const result = await getDatasetResult(observedId);
        // TODO: Donu should indicate to us which column is time based and which should be used as a value
        // Currently some datasets may contain multiple value columns, here we find the first one
        const observedTimes = result.columns.find(column => allowedTimeColumnNames.some(timeName => timeName === column.name));
        const observedValues = result.columns.find(column => !allowedTimeColumnNames.some(timeName => timeName === column.name));

        // Format observed data for chart consumption
        const observed = [];
        for (let i = 0; i < Math.min(observedTimes.values.length, currentRunVariableValuesLen); i++) {
          observed.push({
            x: observedTimes.values[i],
            y: observedValues.values[i],
          });
        }
        variable.observed = observed;
        measures.push({
          uid: variable.uid,
          observed: {
            times: observedTimes.values.slice(0, currentRunVariableValuesLen),
            values: observedValues.values.slice(0, currentRunVariableValuesLen),
          },
          predicted: {
            times: currentRunVariableValues.map(d => d.x),
            values: currentRunVariableValues.map(d => d.y),
          },
        });
      }
    }

    const currentRunErrors = await getSimulationError(
      measures,
      Donu.InterpolationModelTypes.Linear,
      Donu.ErrorModelTypes.L2,
    );
    for (const variable of model.variables) {
      variable.currentRunError = currentRunErrors.measures.find(m => m.uid === variable.uid)?.error_total;
    }
    model.aggregateError = currentRunErrors?.error_total;

    // Force reactive update
    state.models = [...state.models];
  },

  setVariablesAggregate (state: HMI.SimulationState, args: {
    aggregator: Function, /* eslint-disable-line @typescript-eslint/ban-types */
    modelId: number,
  }): void {
    if (!args.aggregator) args.aggregator = d3.mean;
    getModel(state, args.modelId).variables.forEach(variable => {
      // No saved runs, no need to aggregate
      if (state.numberOfSavedRuns < 6) {
        variable.aggregate = null;
        return;
      }

      // A variable.values are a list of runs each containing
      // a list of {x: step, y: value} for each step.
      const valuesOfAllRunsPerStep = {};
      for (let run = 0; run < variable.values.length; run++) {
        if (variable.values[run]) {
          for (let step = 0; step < variable.values[run].length; step++) {
            const { x, y } = variable.values[run][step];

            if (!valuesOfAllRunsPerStep[x]) {
              valuesOfAllRunsPerStep[x] = [y];
            } else {
              valuesOfAllRunsPerStep[x].push(y);
            }
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
    parameter.displayed = args.visibility;
  },

  setAllParametersVisibility (state: HMI.SimulationState, args: {
    modelId: number,
    visibility: boolean,
  }): void {
    getModel(state, args.modelId).parameters.forEach(parameter => {
      parameter.displayed = args.visibility;
    });
  },

  setVariableVisibility (state: HMI.SimulationState, args: {
    modelId: number,
    uid: string,
    visibility: boolean,
  }): void {
    const variable = getVariable(state, args.modelId, args.uid);
    variable.displayed = args.visibility;
  },

  setAllVariablesVisibility (state: HMI.SimulationState, args: {
    modelId: number,
    visibility: boolean,
  }): void {
    getModel(state, args.modelId).variables.forEach(variable => {
      variable.displayed = args.visibility;
    });
  },
};

export {
  state,
  actions,
  getters,
  mutations,
};
