import { QueryFieldMap } from '@/types/typesLex';

/**
 * Marking a field as searchable makes known to LEX.
 * Note a ranged search is more restrictive as the application allows one
 * ranged term per field. This is due to synchronizing against the facets,
 * which only allows a single range.
 */
type SearchableHelperResponse = {
  searchable: true,
  searchDisplay: string,
  ranged: boolean,
}
const _searchable = (searchDisplay: string, ranged: boolean): SearchableHelperResponse => {
  return {
    searchable: true, ranged, searchDisplay,
  };
};

/**
 * This tags the code constant with the API field.
 *
 * Note the field is not the actual DB field but is the abstraction layer field.
 */
type FieldHelperResponse = {
  field: string,
  display: string,
  icon: string,
  iconText: string,
}
const _field = (field: string, display: string, icon = '', iconText = ''): FieldHelperResponse => {
  return { field, display, icon, iconText };
};

/**
 * Configures field attributes, determines how they are displayed and their search semantics
 *
 * Note lexType and baseType defines the value translation needed to go to/from LEX. LEX by default
 * uses string-types while fields can have heterogeneous types.
*/
const QUERY_FIELDS_MAP: QueryFieldMap = {
  // MODELS
  MODEL_TYPE: {
    ..._field('modelType', 'Model Type'),
    ..._searchable('Model Type', false),
    baseType: 'integer',
    lexType: 'string',
  },
  // COSMOS
  COSMOS_QUERY: {
    ..._field('cosmosQuery', 'Keyword'),
    ..._searchable('Keyword', false),
    baseType: 'string',
    lexType: 'string',
  },
  COSMOS_TYPE: {
    ..._field('cosmosType', 'Doc Artifact Type'),
    ..._searchable('Doc Artifact Type', false),
    baseType: 'integer',
    lexType: 'string',
  },
  COSMOS_INCLUSIVE: {
    ..._field('cosmosInclusive', 'Inclusive'),
    ..._searchable('Inclusive', false),
    baseType: 'integer',
    lexType: 'string',
  },
  COSMOS_BASE_CONFIDENCE: {
    ..._field('cosmosBaseConf', 'Base Confidence'),
    ..._searchable('Base Confidence', false),
    baseType: 'string',
    lexType: 'string',
  },
  COSMOS_POSTPROCESSING_CONFIDENCE: {
    ..._field('cosmosPostProcConf', 'Post-Processing Confidence'),
    ..._searchable('Post-Processing Confidence', false),
    baseType: 'string',
    lexType: 'string',
  },
  // Placeholders for testing purposes
  HISTOGRAM: {
    ..._field('histogram', 'Histogram'),
    ..._searchable('Histogram', false),
    baseType: 'integer',
    lexType: 'string',
  },

  // Mocked-up fields
  PATH_QUERY: {
    ..._field('pathQuery', 'Path Query'),
    ..._searchable('Path Query', false),
    baseType: 'string',
    lexType: 'string',
  },
};

export {
  QUERY_FIELDS_MAP,
};
