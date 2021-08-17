import * as Model from '@/types/typesModel';

/**
 * Find all model comparisons which do not have an inverse map in the data (e.g. model1 -> model2
 * exists but model2 -> model1 does not) and generates the inverse map using the pre-existing forward map.
 * @returns {Model.ModelComparisonMap} Returns a model comparison map augmented with the generated
 * inverse data.
 */
const generateComparisonPairs = (input: Model.ModelComparisonMap): Model.ModelComparisonMap => {
  for (const compareAgainst in input) {
    for (const compareTo in input[compareAgainst]) {
      if (!input[compareTo]?.[compareAgainst]) {
        const keys = Object.keys(input[compareAgainst][compareTo]);
        const values = Object.values(input[compareAgainst][compareTo]);

        if (!input[compareTo]) {
          input[compareTo] = {};
        }
        input[compareTo][compareAgainst] = {};
        for (let i = 0; i < keys.length; i++) {
          for (const value of values[i]) {
            if (!input[compareTo][compareAgainst][value]) {
              input[compareTo][compareAgainst][value] = new Set();
              input[compareTo][compareAgainst][value].add(keys[i]);
            }
          }
        }
      }
    }
  }
  return input;
};

/**
 * Parse Model Comparison data structure into a more convenient form. Remove "J:" prefix attached
 * to node names in the raw comparison data.
 * @returns {Model.ModelComparisonMap} Returns a model comparison map generated from the input
 * model comparison data, where every comparison has both forward and inverse comparisons provided.
 */
export const processModelComparison = (input: Model.ModelComparisonData): Model.ModelComparisonMap => {
  const comparisonMap = { [input.apex]: {} };
  const compareAgainst = comparisonMap[input.apex];
  for (const compareTo in input.legs) {
    compareAgainst[compareTo] = compareAgainst[compareTo] ?? {};
    input.legs[compareTo].forEach(compareSet => {
      for (const compareAgainstKey in compareSet) {
        if (!compareAgainst[compareTo][compareAgainstKey]) {
          compareAgainst[compareTo][compareAgainstKey] = new Set();
        }
        compareAgainst[compareTo][compareAgainstKey].add(compareSet[compareAgainstKey]);
      }
    });
  }

  return generateComparisonPairs(comparisonMap);
};
