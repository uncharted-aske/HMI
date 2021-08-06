import _ from 'lodash';
import { COSMOS_TYPE_OPTIONS } from '@/utils/ModelTypeUtil';

import { CosmosSearchBibjsonInterface } from '@/types/typesCosmos';

export const filterToParamObj = (filterObj: {[key: string]: any}): any => {
  const output: any = {};
  if (!_.isEmpty(filterObj.cosmosQuery)) {
    output.query = filterObj.cosmosQuery;
  }
  if (!_.isEmpty(filterObj.cosmosAskeId)) {
    output.aske_id = filterObj.cosmosAskeId;
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

export const getAuthorList = (bibjson: CosmosSearchBibjsonInterface): string => {
  return bibjson === undefined || bibjson.author.length === 0
    ? 'Unknown Author'
    : bibjson.author.reduce((acc, author, index) => {
      acc += author.name;
      if (index !== bibjson.author.length - 1) {
        acc += ', ';
      }
      return acc;
    }, '');
};
