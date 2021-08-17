import _ from 'lodash';
import { COSMOS_TYPE_OPTIONS } from '@/utils/ModelTypeUtil';

import { CosmosSearchBibjsonInterface } from '@/types/typesCosmos';

export const ID_TYPE_MAP = {
  aske_id: 'cosmosAskeId',
  doi: 'cosmosDoi',
};

export const filterToParamObj = (filterObj: {[key: string]: any}): any => {
  const output: any = {};
  if (!_.isEmpty(filterObj.cosmosQuery)) {
    output.query = filterObj.cosmosQuery;
  }
  if (!_.isEmpty(filterObj.cosmosDoi)) {
    output.doi = filterObj.cosmosDoi;
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
  let authors = bibjson?.author;

  if (!authors || authors.length === 0) {
    return 'Unknown Author';
  }

  if (authors.length > 1 && authors.length < 4) {
    authors[authors.length - 1].name = 'and ' + authors[authors.length - 1].name;
  }

  if (authors.length > 3) {
    authors = authors.slice(0, 3);
    authors.push({ name: 'et al.' });
  }

  return authors.map(author => author.name).join(', ');
};

export const getJournal = (bibjson: CosmosSearchBibjsonInterface): string => {
  const journal = bibjson?.journal;
  return (!journal || journal.length === 0) ? 'Unknown Journal' : journal;
};

export const getYear = (bibjson: CosmosSearchBibjsonInterface): string => {
  const year = bibjson?.year;
  return (!year || year.length === 0) ? 'Unknown Year' : year;
};

export const getPublicationInfo = (bibjson: CosmosSearchBibjsonInterface): string => {
  return `${getJournal(bibjson)} ${getYear(bibjson)} – ${getAuthorList(bibjson)}`;
};
