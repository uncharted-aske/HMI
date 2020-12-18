import _ from 'lodash';
import { COSMOS_TYPE_OPTIONS } from './ModelTypeUtil';

const WISC_API_URL = 'https://xdd.wisc.edu/sets/xdd-covid-19/cosmos/api/search';

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

export const wiscFetch = async (paramObj: URLSearchParams): Promise<any> => {
  const init: RequestInit = {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
  };
  // TypeScript URL type incorrect
  // eslint-disable-next-line
  const url: any = new URL(WISC_API_URL);
  url.search = new URLSearchParams(paramObj).toString();
  try {
    const response = await fetch(url, init);
    return await response.json();
  } catch (e) {
    return e;
  }
};
