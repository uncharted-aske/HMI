import { GetterTree, ActionTree } from 'vuex';
import * as Donu from '@/types/typesDonu';
import * as HMI from '@/types/types';
import { getModelResult } from '@/services/DonuService';

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

const currentNumberOfRuns = (state: SimulationState): number => state.parameters?.[0]?.values.length ?? 0;

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
        obj[parameter.name] = parameter.values[i];
        return obj;
      }, {});
    }
    return output;
  },

  getSimVariables (state: SimulationState): HMI.SimulationVariable[] {
    return state.variables;
  },
};

const actions: ActionTree<SimulationState, HMI.SimulationParameter[]> = {
  setSimParameters ({ state }, args: { parameters: HMI.SimulationParameter[], count: number }): void {
    state.parameters = args.parameters;
    state.numberOfSavedRuns = args.count ?? currentNumberOfRuns(state);
  },

  setSimParameterValue ({ state }, args: { name: string, value: number }): void {
    if (currentNumberOfRuns(state) < state.numberOfSavedRuns) {
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

  incrNumberOfSavedRuns ({ state }): void {
    state.numberOfSavedRuns += 1;
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
