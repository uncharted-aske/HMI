import { GetterTree, ActionTree } from 'vuex';
import * as HMI from '@/types/types';
// import * as Route from '@/utils/RouteUtil';

const state: {
    parameters: HMI.SimulationParameter[],
    variables: HMI.SimulationVariable[],
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
      obj[parameter.name] = parameter.values[0];
      return obj;
    }, {});
  },

  getSimVariables (state): HMI.SimulationVariable[] {
    return state.variables;
  },
};

const actions: ActionTree<any, HMI.SimulationParameter[]> = {
  setSimParameters ({ state }, paramArr: HMI.SimulationParameter[]): void {
    state.parameters = paramArr;
  },

  setSimParameterValue ({ state }, args: { name: string, value: number }): void {
    state.parameters = state.parameters.map(parameter => {
      if (parameter.name === args.name) {
        parameter.values = [args.value];
      }
      return parameter;
    });
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
