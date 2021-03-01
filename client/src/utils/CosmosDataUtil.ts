import _ from 'lodash';
import { COSMOS_TYPE_OPTIONS } from '@/utils/ModelTypeUtil';

import { CosmosSearchObjectsInterface } from '@/types/typesCosmos';

export const filterToParamObj = (filterObj: {[key: string]: any}): any => {
  const output: any = {};
  if (!_.isEmpty(filterObj.cosmosQuery)) {
    output.query = filterObj.cosmosQuery;
  }
  if (!_.isEmpty(filterObj.cosmosType)) {
    output.type = filterObj.cosmosType.map(type => COSMOS_TYPE_OPTIONS[type]);
  }
  if (!_.isEmpty(filterObj.cosmosInclusive)) {
    output.inclusive = Boolean(filterObj.cosmosInclusive);
  }
  if (!_.isEmpty(filterObj.cosmosBaseConf)) {
    output.base_confidence = filterObj.cosmosBaseConf.map(num => parseFloat(num));
  }
  if (!_.isEmpty(filterObj.cosmosPostProcConf)) {
    output.postprocessing_confidence = filterObj.cosmosPostProcConf.map(num => parseFloat(num));
  }

  return output;
};

export const getAuthorList = (item: CosmosSearchObjectsInterface): string => {
  return item.bibjson === undefined || item.bibjson.author.length === 0
    ? 'Unknown Author'
    : item.bibjson.author.reduce((acc, author, index) => {
      acc += author.name;
      if (index !== item.bibjson.author.length - 1) {
        acc += ', ';
      }
      return acc;
    }, '');
};
