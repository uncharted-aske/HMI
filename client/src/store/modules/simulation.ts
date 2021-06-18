import { GetterTree, ActionTree } from 'vuex';
import * as HMI from '@/types/types';
import * as Donu from '@/types/typesDonu';
import { getModelParameters, getModelResult, getModelVariables } from '@/services/DonuService';
import * as lodash from 'lodash';
import { aggregateModelResults, donuSimulateToVariable } from '@/utils/DonuUtil';

const state: {
    parametersMaxCount: number, // Holds the maximum number of parameter sets which should be stored
    parameters: HMI.SimulationParameter[],
    variables: HMI.SimulationVariable[],
    variablesAggregate: HMI.SimulationVariable[],
} = {
  parametersMaxCount: 0,
  parameters: [],
  variables: [],
  variablesAggregate: [],
};

const getSimParametersCount = (state): number => {
  return state.parameters[0]?.values.length;
};

const getters: GetterTree<any, HMI.SimulationParameter[]> = {
  getSimParameters (state): HMI.SimulationParameter[] {
    return state.parameters;
  },

  getSimParametersCount (state): number {
    return getSimParametersCount(state);
  },

  getSimParameterArray (state): any {
    const stateParameterCount = getSimParametersCount(state);
    const output = new Array(stateParameterCount);
    for (let i = 0; i < stateParameterCount; i++) {
      output[i] = state.parameters.reduce((obj, parameter) => {
        obj[parameter.name] = parameter.values[i];
        return obj;
      }, {});
    }
    return output;
  },

  getSimVariables (state): HMI.SimulationVariable[] {
    return state.variables;
  },

  getSimVariablesAggregate (state): HMI.SimulationVariable {
    return state.variablesAggregate;
  },

  hasVariablesRuns (state): boolean {
    return !lodash.isEmpty(state.variables?.[0]?.values?.[0]);
  },
};

const actions: ActionTree<any, HMI.SimulationParameter[]> = {
  setSimParameters ({ state }, args: { parameters: HMI.SimulationParameter[], count: number }): void {
    state.parameters = args.parameters;
    state.parametersMaxCount = args.count ?? getSimParametersCount(state);
  },

  setSimParameterValue ({ state }, args: { name: string, value: number }): void {
    if (getSimParametersCount(state) < state.parametersMaxCount) {
      state.parameters = state.parameters.map(parameter => {
        const currentParamsCount = parameter.values.length;
        parameter.values[currentParamsCount] = parameter.values[currentParamsCount - 1];
        return parameter;
      });
    }

    state.parameters = state.parameters.map(parameter => {
      if (parameter.name === args.name) {
        parameter.values[parameter.values.length - 1] = args.value;
      }
      return parameter;
    });
  },

  incrParametersMaxCount ({ state }): void {
    state.parametersMaxCount += 1;
  },

  setSimVariables ({ state }, varArr: HMI.SimulationVariable[]): void {
    state.variables = varArr;
  },

  setSimVariablesVisibility ({ state }, args: boolean): void {
    state.variables = state.variables.map(variable => {
      variable.hidden = Boolean(args);
      return variable;
    });
  },

  setSimVariableVisibility ({ state }, args: string): void {
    state.variables = state.variables.map(variable => {
      if (variable.name === args) {
        variable.hidden = !variable.hidden;
      }
      return variable;
    });
  },

  async fetchModelResults ({ state, getters, dispatch }, { model, config, aggregator }): Promise<void> {
    const modelResults: Donu.SimulationResponse[] = await Promise.all(
      getters.getSimParameterArray.map(simParamArr => getModelResult(model, simParamArr, config)),
    );
    dispatch('setSimVariables', donuSimulateToVariable(modelResults as Donu.SimulationResponse[]));

    state.variablesAggregate = donuSimulateToVariable([aggregateModelResults(modelResults, aggregator)]);
  },

  async initializeSimParameters ({ state }, model: HMI.ModelInterface): Promise<void> {
    const donuParameters = await getModelParameters(model) ?? [];
    state.parameters = donuParameters.map(donuParameter => ({
      ...donuParameter,
      hidden: false,
      values: [donuParameter.defaultValue],
    }));
    state.parametersMaxCount = 1;
  },

  async initializeSimVariables ({ state }, model: HMI.ModelInterface): Promise<void> {
    const donuVariables = await getModelVariables(model) ?? [];
    state.variables = donuVariables.map(donuVariable => ({
      ...donuVariable,
      hidden: false,
      values: [[]],
    }));
  },

  resetSim ({ state }): void {
    state.parametersMaxCount = 0;
    state.parameters = [];
    state.variables = [];
    state.variablesAggregate = [];
  },
};

export {
  actions,
  getters,
  state,
};
