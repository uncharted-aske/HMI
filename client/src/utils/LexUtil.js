import _ from 'lodash';
import { ValueStateValue } from '@uncharted.software/lex/dist/lex';

const SUGGESTIONS_LIMIT = 10;

/**
 * Suggestion builder for MappedOptionState
 *
 * @param {string} message - assistant message
 * @param {boolean} isMultiValue - if state allows multi value
 * @param {object} map - key/value map
 */
function mappedSuggestionBuilder (message, isMultiValue, map) {
  const states = Object.keys(map).map(key => {
    return new ValueStateValue(key, { key: key, searchKey: map[key] });
  });

  return {
    name: message,
    suggestionLimit: SUGGESTIONS_LIMIT,
    fetchSuggestions: function (hint = '') {
      return states.filter(d => {
        return d.meta.searchKey.includes(hint);
      });
    },
    multivalue: isMultiValue,
    allowUnknown: false,
    map: map,
  };
}

const convertToLex = (values, lexType) => {
  return _convertTo(values, lexType);
};

const convertFromLex = (values, baseType) => {
  const flattened = _.isArray(values) ? values.map(v => v.key) : [values.key];
  return _convertTo(flattened, baseType);
};

function _convertTo (values, convertType) {
  let result = values;

  if (convertType === 'integer') {
    result = values.map(r => +r);
  } else if (convertType === 'string') {
    result = values.map(r => '' + r);
  }
  return result;
}

export default {
  mappedSuggestionBuilder,
  convertToLex,
  convertFromLex,
};
