/* eslint camelcase: 0 */

export interface CosmosSearchChildrenInterface {
  base_confidence: number;
  bytes: string;
  cls: string;
  content: string;
  header_content: string | null;
  id: string;
  postprocessing_confidence: number;
}

export interface CosmosSearchBibjsonInterface {
  type: string;
  _gddid: string;
  title: string;
  volume: string;
  journal: string;
  link: {
    url: string;
    type: string;
  }[];
  publisher: string;
  author: {
    name: string;
  }[];
  pages: string;
  number: string;
  identifier: {
    type: string;
    id: string;
  }[];
  year: string;
}

export interface CosmosSearchObjectsInterface {
  header: any;
  pdf_name: string;
  children: CosmosSearchChildrenInterface[];
  bibjson: CosmosSearchBibjsonInterface;
}

export interface CosmosSearchInterface {
  /** Cosmos API version */
  v: string;
  total?: number;
  page?: number;
  objects?: CosmosSearchObjectsInterface[];
  error?: string,
}

export interface CosmosArtifactObjectInterface {
  base_confidence: number,
  bytes: string,
  cls: string,
  content: string,
  header_content: string | null;
  postprocessing_confidence: number,
}

export interface CosmosArtifactInterface {
  bibjson: CosmosSearchBibjsonInterface,
  license: string,
  objects: CosmosArtifactObjectInterface[],
  page: number,
  total: number,
  /** Cosmos API version */
  v: string,
  error?: any,
}

export interface CosmosTextSnippet {
  pubname: string,
  publisher: string,
  _gddid: string,
  title: string,
  doi: string,
  coverDate: string,
  URL: string,
  authors: string,
  highlight: string[]
}
export interface CosmosSimilarDataInterface {
  bibson: CosmosSearchBibjsonInterface;
  objects: CosmosArtifactObjectInterface[];
  score: number;
}

export interface CosmosSimilarInterface {
  status: number;
  data: CosmosSimilarDataInterface[];
}

export interface CosmosRelatedEntitiesDrugsInterface {
  hits: number;
  exclude_from_druglist: string;
  drugs: string;
  drugID: string;
  preferred: string;
}

export interface CosmosRelatedEntitiesDataInterface {
  // Extends CosmosSearchBibjsonInterface
  type: string;
  _gddid: string;
  title: string;
  volume: string;
  journal: string;
  link: {
    url: string;
    type: string;
  }[];
  publisher: string;
  author: {
    name: string;
  }[];
  pages: string;
  number: string;
  identifier: {
    type: string;
    id: string;
  }[];
  year: string;
  // End Extends CosmosSearchBibjsonInterface
  known_entities: {
    drugs?: CosmosRelatedEntitiesDrugsInterface[];
  }
}

export interface CosmosRelatedEntitiesInterface {
  success: {
    v: number;
    data: CosmosRelatedEntitiesDataInterface[];
  }
}

export interface CosmosRelatedParametersInterface {
  status: number;
  data: string[];
}
