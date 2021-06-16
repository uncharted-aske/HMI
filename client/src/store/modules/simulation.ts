import { GetterTree, ActionTree } from 'vuex';
import * as Donu from '@/types/typesDonu';
import * as HMI from '@/types/types';
import { getModelResult } from '@/services/DonuService';

const state: {
    parametersMaxCount: number, // Holds the maximum number of parameter sets which should be stored
    parameters: HMI.SimulationParameter[],
    variables: HMI.SimulationVariable[],
    runs: {
      parameters: any,
      variables: number[],
    }[]
} = {
  parametersMaxCount: 0,
  parameters: [],
  variables: [],
  runs: [],
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

  setSimVariables ({ state }, varArr: HMI.SimulationVariable): void {
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

  async getModelResults ({ getters }, args: {
    model: HMI.ModelInterface,
    config: Donu.RequestConfig,
  }): Promise<Donu.SimulationResponse[]> {
    return await Promise.all(
      getters.getSimParameterArray.map(simParamArr => {
        return getModelResult(args.model, simParamArr, args.config);
      }),
    );
  },
};

export {
  actions,
  getters,
  state,
};
