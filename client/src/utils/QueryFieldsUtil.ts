import { QueryFieldMap } from '../types/types';

/**
 * Marking a field as searchable makes known to LEX.
 * Note a ranged search is more restrictive as the application allows one
 * ranged term per field. This is due to synchronizing against the facets,
 * which only allows a single range.
 *
 * @param {string} searchDisplay - text display
 * @param {boolean} ranged - if the search is ranged or not
 */
const _searchable = (searchDisplay, ranged): any => {
  return {
    searchable: true, ranged, searchDisplay,
  };
};

/**
 * This tags the code constant with the API field.
 *
 * Note the field is not the actual DB field but is the abstraction layer field.
 *
 * @param {string} field - field name
 * @param {string} display - human readable display
 */
const _field = (field, display, icon = null, iconText = ''): any => {
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
};

export {
  QUERY_FIELDS_MAP,
};
