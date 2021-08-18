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
  const list = bibjson?.author;

  if (!list || list.length === 0) {
    return 'Unknown Author';
  }

  // Remove comma to avoid mistake with the list itself.
  // TODO - There is no way to clean this up efficiently, there are so many cases
  // and the data isn't clean enough. I think this is out of scope for now.
  let authors = list.map(author => {
    if (author.name.includes(',')) {
      const [lastname, firstnames] = author.name.split(', ');
      return firstnames + ' ' + lastname;
    }
    return author.name;
  });

  // If the list is three or less, we use an Oxford comma.
  if (authors.length > 1 && authors.length < 4) {
    authors.push('and ' + authors.pop());
  }

  // If there is more than three, we cut off the others.
  if (authors.length > 3) {
    authors = authors.slice(0, 3);
    authors.push('et al.');
  }

  return authors.join(', ');
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
