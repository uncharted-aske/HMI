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

const COSMOS_API_URL = 'https://xdd.wisc.edu/sets/xdd-covid-19/cosmos/api/search';

export const cosmosSearch = (paramObj: URLSearchParams): Promise<CosmosSearchInterface> => {
  return getUtilMem(COSMOS_API_URL, { api_key: COSMOS_API_KEY, ...paramObj });
};

/// /////////////////////////////////////////////

const COSMOS_ARTIFACT_SRC_URL = 'https://xdd.wisc.edu/sets/xdd-covid-19/cosmos/api/object/';

// eslint-disable-next-line camelcase
export const cosmosArtifactSrc = (id: string): Promise<CosmosSearchInterface> => {
  return getUtilMem(COSMOS_ARTIFACT_SRC_URL + id, { api_key: COSMOS_API_KEY });
};

/// /////////////////////////////////////////////

const COSMOS_ARTIFACT_URL = 'https://xdd.wisc.edu/sets/xdd-covid-19/cosmos/api/document';

// eslint-disable-next-line camelcase
export const cosmosArtifactsMem = async (paramObj: {doi: string}): Promise<CosmosArtifactInterface> => {
  const artifactList = await getUtilMem(COSMOS_ARTIFACT_URL, { api_key: COSMOS_API_KEY, ...paramObj });
  artifactList.objects.map(async (artifact, index) =>
    Object.assign(artifactList.objects[index], artifact.children[0]));
  return artifactList;
};

/// /////////////////////////////////////////////

const COSMOS_SIMILAR_URL = 'https://xdd.wisc.edu/sets/xdd-covid-19/doc2vec/api/similar';

// eslint-disable-next-line camelcase
export const cosmosSimilar = async (doi: string): Promise<CosmosSimilarInterface> => {
  const similarList = await getUtilMem(COSMOS_SIMILAR_URL, { api_key: COSMOS_API_KEY, doi });
  await Promise.all(similarList.data.map(async (similar, index) => {
    const response = await cosmosArtifactsMem({ doi: similar.bibjson.identifier[0].id });
    similarList.data[index].objects = response.objects;
  }));
  return similarList;
};

/// /////////////////////////////////////////////

const COSMOS_RELATED_ENTITIES = 'https://xdd.wisc.edu/api/articles';

// eslint-disable-next-line camelcase
export const cosmosRelatedEntities = (paramObj: {doi: string, known_entities: string}): Promise<CosmosRelatedEntitiesInterface> => {
  return getUtilMem(COSMOS_RELATED_ENTITIES, { api_key: COSMOS_API_KEY, ...paramObj });
};

/// /////////////////////////////////////////////

const COSMOS_RELATED_PARAMETERS = 'https://xdd.wisc.edu/sets/xdd-covid-19/word2vec/api/most_similar';

// eslint-disable-next-line camelcase
export const cosmosRelatedParameters = (paramObj: {word: string, model: string, n: number}): Promise<CosmosRelatedParametersInterface> => {
  return getUtilMem(COSMOS_RELATED_PARAMETERS, { api_key: COSMOS_API_KEY, ...paramObj });
};
