import _ from 'lodash';
import { COSMOS_TYPE_OPTIONS } from './ModelTypeUtil';
import { CosmosSearchInterface, CosmosArtifactInterface } from '@/types/typesCosmos';

import { getUtilMem } from './FetchUtil';

/// /////////////////////////////////////////////

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

/// /////////////////////////////////////////////

const COSMOS_API_KEY = process.env.COSMOS_API_KEY;
const COSMOS_ARTIFACT_SRC_URL = 'https://xdddev.chtc.io/sets/xdd-covid-19/cosmos/api/object/';

// eslint-disable-next-line camelcase
export const cosmosArtifactSrc = (id: string): Promise<CosmosSearchInterface> => {
  const paramObj = { api_key: COSMOS_API_KEY };
  return getUtilMem(COSMOS_ARTIFACT_SRC_URL + id, paramObj as unknown as URLSearchParams);
};

/// /////////////////////////////////////////////

const COSMOS_ARTIFACT_URL = 'https://xdddev.chtc.io/sets/xdd-covid-19/cosmos/api/document';

// eslint-disable-next-line camelcase
export const cosmosArtifactsMem = async (paramObj: {doi: string, api_key?: string}): Promise<CosmosArtifactInterface> => {
  paramObj.api_key = COSMOS_API_KEY;
  const artifactList = await getUtilMem(COSMOS_ARTIFACT_URL, paramObj as unknown as URLSearchParams);
  await Promise.all(artifactList.objects.map(async (artifact, index) => {
    const response = await cosmosArtifactSrc(artifact.id);
    artifactList.objects[index].bytes = response.objects[0].children[0].bytes;
  }));
  return artifactList;
};
