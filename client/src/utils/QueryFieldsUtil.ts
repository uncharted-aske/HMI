import { QueryFieldMap } from '@/types/typesLex';
import { FILTRES, FILTRES_FIELDS } from '@/types/typesFiltres';

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
  // BIO MODELS
  BIO_NODE_PRE: {
    ..._field('bioNodePre', 'Node Pre'),
    ..._searchable('Node Pre', false),
    baseType: 'integer',
    lexType: 'integer',
  },
  BIO_NODE_NAME: {
    ..._field('bioNodeName', 'Node Name'),
    ..._searchable('Node Name', false),
    baseType: 'string',
    lexType: 'string',
  },
  BIO_NODE_GROUNDED: {
    ..._field('bioNodeGrounded', 'Node Grounded'),
    ..._searchable('Node Grounded', false),
    baseType: 'integer',
    lexType: 'integer',
  },
  BIO_NODE_GROUNDED_ONTO: {
    ..._field('bioNodeGroundedOnto', 'Node Group'),
    ..._searchable('Node Group', false),
    baseType: 'integer',
    lexType: 'integer',
  },
  BIO_NODE_IN_DEGREE: {
    ..._field('bioNodeInDegree', 'Node In-degree'),
    ..._searchable('Node In-degree', false),
    baseType: 'integer',
    lexType: 'integer',
  },
  BIO_NODE_OUT_DEGREE: {
    ..._field('bioNodeOutDegree', 'Node Out-degree'),
    ..._searchable('Node Out-degree', false),
    baseType: 'integer',
    lexType: 'integer',
  },
  BIO_NODE_POST: {
    ..._field('bioNodePost', 'Node Post'),
    ..._searchable('Node Post', false),
    baseType: 'integer',
    lexType: 'integer',
  },
  BIO_EDGE_PRE: {
    ..._field('bioEdgePre', 'Edge Pre'),
    ..._searchable('Edge Pre', false),
    baseType: 'integer',
    lexType: 'integer',
  },
  BIO_EDGE_TESTED: {
    ..._field('bioEdgeTested', 'Edge Tested'),
    ..._searchable('Edge Tested', false),
    baseType: 'integer',
    lexType: 'integer',
  },
  BIO_EDGE_DOI: {
    ..._field('bioEdgeDoi', 'Edge DOI'),
    ..._searchable('Edge DOI', false),
    baseType: 'string',
    lexType: 'string',
  },
  BIO_EDGE_TYPE: {
    ..._field('bioEdgeType', 'Edge Type'),
    ..._searchable('Edge Type', false),
    baseType: 'integer',
    lexType: 'string',
    order: 1,
  },
  BIO_EDGE_BELIEF: {
    ..._field(
      FILTRES[FILTRES_FIELDS.BELIEF_SCORE].name,
      FILTRES[FILTRES_FIELDS.BELIEF_SCORE].displayName,
    ),
    ..._searchable(
      FILTRES[FILTRES_FIELDS.BELIEF_SCORE].displayName,
      false,
    ),
    baseType: 'integer',
    lexType: 'string',
  },
  BIO_EDGE_POST: {
    ..._field('bioEdgePost', 'Edge Post'),
    ..._searchable('Edge Post', false),
    baseType: 'integer',
    lexType: 'integer',
  },
  // COSMOS
  COSMOS_QUERY: {
    ..._field('cosmosQuery', 'Keyword'),
    ..._searchable('Keyword', false),
    baseType: 'string',
    lexType: 'string',
    order: 2,
  },
  COSMOS_TYPE: {
    ..._field('cosmosType', 'Doc Artifact Type'),
    ..._searchable('Doc Artifact Type', false),
    baseType: 'integer',
    lexType: 'string',
    order: 1,
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
