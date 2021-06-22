import { GetterTree, ActionTree } from 'vuex';
import * as HMI from '@/types/types';
import * as Donu from '@/types/typesDonu';
import { getModelParameters, getModelResult, getModelVariables } from '@/services/DonuService';
import { aggregateModelResults, donuSimulateToVariable } from '@/utils/DonuUtil';

type SimulationState = {
  numberOfSavedRuns: number,
  parameters: HMI.SimulationParameter[],
  variables: HMI.SimulationVariable[],
  variablesAggregate: HMI.SimulationVariable[],
}

const state: SimulationState = {
  numberOfSavedRuns: 0,
  parameters: [],
  variables: [],
  variablesAggregate: [],
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
        obj[parameter.name] = parameter.values[i];
        return obj;
      }, {});
    }
    return output;
  },

  getSimVariables (state: SimulationState): HMI.SimulationVariable[] {
    return state.variables;
  },

  getSimVariablesAggregate (state): HMI.SimulationVariable {
    return state.variablesAggregate;
  },

  getVariablesRunsCount (state): number {
    return state.variables?.[0]?.values?.length;
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
    state.numberOfSavedRuns = 1;
  },

  async initializeSimVariables ({ state }, model: HMI.ModelInterface): Promise<void> {
    const donuVariables = await getModelVariables(model) ?? [];
    state.variables = donuVariables.map(donuVariable => ({
      ...donuVariable,
      hidden: false,
      values: [],
    }));
  },

  resetSim ({ state }): void {
    state.numberOfSavedRuns = 0;
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
