import { GetterTree, ActionTree } from 'vuex';
import * as HMI from '@/types/types';
// import * as Route from '@/utils/RouteUtil';

const state: {
    parameters: HMI.SimulationParameter[],
    variables: any,
    runs: {
      parameters: any, // list of parameters value { 'beta': 2, 's_initial': 0.07 }
      variables: number[],
    }[]
} = {
  parameters: [],
  variables: [],
  runs: [],
};

const getters: GetterTree<any, HMI.SimulationParameter[]> = {
  getSimParameters (state): HMI.SimulationParameter[] {
    return state.parameters;
  },

  getSimParameterObject (state): any {
    return state.parameters.reduce((obj, parameter) => {
      obj[parameter.name] = parameter.value;
      return obj;
    }, {});
  },

  getSimVariables (state): any {
    return state.variables;
  },
};

const actions: ActionTree<any, HMI.SimulationParameter[]> = {
  setSimParameters ({ state }, paramArr: HMI.SimulationParameter[]): void {
    state.parameters = paramArr;
  },

  setSimParameterValue ({ state }, args: { name: string, value: number }): void {
    for (const parameter of state.parameters) {
      if (parameter.name === args.name) {
        parameter.value = args.value;
      }
    }
  },

  setSimVariables ({ state }, varArr: any): void {
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
};

export {
  actions,
  getters,
  state,
};
