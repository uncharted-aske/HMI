/* eslint camelcase: 0 */

export interface CosmosSearchChildrenInterface {
  id: string;
  bytes: string;
  cls: string;
  postprocessing_confidence: number;
  base_confidence: number;
  content: string;
  header_content: string | null;
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
  v: string;
  total: number;
  page: number;
  objects: CosmosSearchObjectsInterface[];
}
