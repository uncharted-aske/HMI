import _ from 'lodash';
import { COSMOS_TYPE_OPTIONS } from './ModelTypeUtil';
import { CosmosSearchInterface } from '@/types/typesCosmos';

import { getUtilMem } from './FetchUtil';

const COSMOS_API_URL = 'https://xdd.wisc.edu/sets/xdd-covid-19/cosmos/api/search';

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

export const cosmosSearch = (paramObj: URLSearchParams): Promise<CosmosSearchInterface> => {
  return getUtilMem(COSMOS_API_URL, paramObj);
};
