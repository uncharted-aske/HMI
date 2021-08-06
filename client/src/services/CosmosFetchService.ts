import _ from 'lodash';
import {
  CosmosSearchInterface,
  CosmosArtifactInterface,
  CosmosSimilarInterface,
  CosmosRelatedEntitiesInterface,
  CosmosRelatedParametersInterface,
} from '@/types/typesCosmos';

import { getUtilMem } from '@/utils/FetchUtil';

const COSMOS_API_KEY = process.env.COSMOS_API_KEY;

// Note: Description and input parameters can be found by accessing each API URL with no parameters attached using a web browser
// Note: https://xdd.wisc.edu is the production endpoint, as opposed to https://xdddev.chtc.io which is the development endpoint

/// /////////////////////////////////////////////

const COSMOS_API_URL_PREFIX = process.env.NODE_ENV === 'development'
  ? 'https://xdd.wisc.edu'
  : `${window.location.origin}/services/cosmos`;

const COSMOS_API_URL = `${COSMOS_API_URL_PREFIX}/sets/xdd-covid-19/cosmos/api/search`;

const addCosmosAPIKey = (paramObj: Record<string, any>): Record<string, any> => {
  if (process.env.NODE_ENV === 'development') {
    // API key added in local development
    return Object.assign(paramObj, { api_key: COSMOS_API_KEY });
  } else {
    // In production environments API key should not sent to client to avoid exposing secrets
    return paramObj;
  }
};

export const cosmosSearch = (paramObj: URLSearchParams): Promise<CosmosSearchInterface> => {
  return getUtilMem(COSMOS_API_URL, addCosmosAPIKey({ ...paramObj }));
};

/// /////////////////////////////////////////////

const COSMOS_ARTIFACT_SRC_URL = `${COSMOS_API_URL_PREFIX}/sets/xdd-covid-19/cosmos/api/object/`;

// eslint-disable-next-line camelcase
export const cosmosArtifactSrc = (id: string): Promise<CosmosSearchInterface> => {
  return getUtilMem(COSMOS_ARTIFACT_SRC_URL + id, addCosmosAPIKey({}));
};

/// /////////////////////////////////////////////

const COSMOS_ARTIFACT_URL = `${COSMOS_API_URL_PREFIX}/sets/xdd-covid-19/cosmos/api/document`;

// eslint-disable-next-line camelcase
export const cosmosArtifactsMem = async (paramObj: {doi?: string, aske_id?: string, image_type?: string}): Promise<CosmosArtifactInterface> => {
  const artifactList = await getUtilMem(COSMOS_ARTIFACT_URL, addCosmosAPIKey({ ...paramObj }));
  if (artifactList.objects) {
    artifactList.objects.map(async (artifact, index) =>
      Object.assign(artifactList.objects[index], artifact.children[0]));
  }
  return artifactList;
};

/// /////////////////////////////////////////////

const COSMOS_SIMILAR_URL = `${COSMOS_API_URL_PREFIX}/sets/xdd-covid-19/doc2vec/api/similar`;

// eslint-disable-next-line camelcase
export const cosmosSimilar = async (paramObj: {doi: string, image_type?: string}): Promise<CosmosSimilarInterface> => {
  const similarList = await getUtilMem(COSMOS_SIMILAR_URL, addCosmosAPIKey({ doi: paramObj.doi }));
  if (_.isArray(similarList.data)) {
    await Promise.all(similarList.data.map(async (similar, index) => {
      const response = await cosmosArtifactsMem({ doi: similar.bibjson.identifier[0].id, image_type: paramObj.image_type });
      similarList.data[index].objects = response.objects;
    }));
  } else {
    similarList.data = [];
  }
  return similarList;
};

/// /////////////////////////////////////////////

const COSMOS_RELATED_ENTITIES = `${COSMOS_API_URL_PREFIX}/api/articles`;

// eslint-disable-next-line camelcase
export const cosmosRelatedEntities = (paramObj: {doi: string, known_entities: string}): Promise<CosmosRelatedEntitiesInterface> => {
  return getUtilMem(COSMOS_RELATED_ENTITIES, addCosmosAPIKey({ ...paramObj }));
};

/// /////////////////////////////////////////////

const COSMOS_RELATED_PARAMETERS = `${COSMOS_API_URL_PREFIX}/sets/xdd-covid-19/word2vec/api/most_similar`;

// eslint-disable-next-line camelcase
export const cosmosRelatedParameters = (paramObj: {word: string, model: string, n: number}): Promise<CosmosRelatedParametersInterface> => {
  return getUtilMem(COSMOS_RELATED_PARAMETERS, addCosmosAPIKey({ ...paramObj }));
};
