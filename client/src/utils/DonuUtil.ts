/** Utilities to manipulate Donu Types */
import * as d3 from 'd3';
import * as HMI from '@/types/types';
import * as Donu from '@/types/typesDonu';
import * as Model from '@/types/typesModel';

/** Transform a Donu Model to a Model */
export const donuToModel = (donuModels: Donu.ModelDefinition[]): Model.Model[] => {
  return donuModels.map((model, index) => {
    return {
      metadata: {
        name: model.name ?? 'Donu ' + index,
        source: model.source.file,
        type: model.type,
      },
      graph: null,
    } as any;
  });
};

export const aggregateModelResults = (
  modelResults: Donu.SimulationResponse[],
  aggregator = d3.mean, // calculate MEAN by default
): Donu.SimulationResponse => {
  if (modelResults.length === 0) {
    return;
  }

  // Arrange data into column sets which are arrays containing all values at a given x position
  const aggregateValues = {};
  for (const dataset of modelResults) {
    for (const dataKeyName in dataset.values) {
      if (!aggregateValues[dataKeyName]) {
        aggregateValues[dataKeyName] = [];
      }

      for (let i = 0; i < dataset.values[dataKeyName].length; i++) {
        if (!aggregateValues[dataKeyName][i]) {
          aggregateValues[dataKeyName][i] = [];
        }
        aggregateValues[dataKeyName][i].push(dataset.values[dataKeyName][i]);
      }
    }
  }

  // Process data column sets using aggregator function to produce a singular value
  for (const dataKeyName in aggregateValues) {
    aggregateValues[dataKeyName] = aggregateValues[dataKeyName].map(dataColumn => aggregator(dataColumn));
  }

  return {
    times: modelResults[0].times,
    values: aggregateValues,
  };
};

export const donuSimulateToVariable = (responseArr: Donu.SimulationResponse[]): HMI.SimulationVariable[] => {
  const output = {};
  for (const response of responseArr) {
    for (const key in response.values) {
      const keyOutput: any = (output[key] = output[key] || {});
      keyOutput.name = key;
      keyOutput.hidden = false;
      (keyOutput.values = keyOutput.values || []).push(response.values[key].map((y, i) => ({ x: response.times[i], y })));
    }
  }

  return Object.values(output);
};
