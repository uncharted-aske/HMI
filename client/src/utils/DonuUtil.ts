/** Utilities to manipulate Donu Types */
import { ModelInterface, ModelInterfaceType, SimulationVariable } from '@/types/types';
import * as Donu from '@/types/typesDonu';

/** Transform a Donu Model to a ModelInterface */
export function donuToModel (donuModels: Donu.ModelDefinition[]): ModelInterface[] {
  return donuModels.map((model, index) => {
    return {
      metadata: {
        name: model.name ?? 'Donu ' + index,
        source: model.source.file,
        type: model.type,
      },
      graph: null,
      type: ModelInterfaceType.computational,
    } as ModelInterface;
  });
}

export function donuSimulateToD3 (response: Donu.SimulationResponse): SimulationVariable[] {
  const output = [];
  for (const key in response.values) {
    const keyOutput: any = [];
    keyOutput.name = key;
    keyOutput.hidden = false;
    keyOutput.values = [];

    keyOutput.values.push(response.values[key].map((y, i) => ({ x: response.times[i], y })));

    output.push(keyOutput);
  }
  return output;
}
