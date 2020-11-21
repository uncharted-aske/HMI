import _ from 'lodash';
import { ValueStateValue } from '@uncharted.software/lex/dist/lex';
import { MappedOptions, MappedOptionStateConfig, LexConvertType, LexConvertTypeMapping } from '@/types/types';

const SUGGESTIONS_LIMIT = 10;

/**
 * Suggestion builder for MappedOptionState
 *
 * @param message - assistant message
 * @param isMultiValue - if state allows multiple values
 * @param mappedOptions - Suggestions to be used as mapped options
 */
function mappedSuggestionBuilder (message: string, isMultiValue: boolean, mappedOptions: MappedOptions): MappedOptionStateConfig {
  const states = Object.keys(mappedOptions).map(key => {
    return new ValueStateValue(key, { key: key, searchKey: mappedOptions[key] });
  });

  return {
    name: message,
    suggestionLimit: SUGGESTIONS_LIMIT,
    // TODO: Generate Lex types to retrieve type for ValueState.config.fetchSuggestions
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    fetchSuggestions: function (hint = '') {
      return states.filter(d => {
        return d.meta.searchKey.includes(hint);
      });
    },
    multivalue: isMultiValue,
    allowUnknown: false,
    mappedOptions,
  };
}

function _convertTo (values: LexConvertTypeMapping[LexConvertType][], convertType: LexConvertType): LexConvertTypeMapping[LexConvertType][] {
  if (convertType === 'integer') {
    return values.map(r => +r) as number[];
  } else if (convertType === 'string') {
    return values.map(r => '' + r) as string[];
  } else {
    throw Error('No conversion implemented for convert types');
  }
}

const convertToLex = (values: LexConvertTypeMapping[LexConvertType][], lexType: LexConvertType): LexConvertTypeMapping[LexConvertType][] => {
  return _convertTo(values, lexType);
};

const convertFromLex = (values: unknown, baseType: LexConvertType): LexConvertTypeMapping[LexConvertType][] => {
  if (_.isArray(values)) {
    // Handle lex array values
    const valuesArray = values as any[];
    const flattened = valuesArray.map(v => v.key) as LexConvertTypeMapping[LexConvertType][];
    return _convertTo(flattened, baseType);
  } else if (_.isPlainObject(values)) {
    // Handle lex object values
    const valuesObject = values as any;
    const flattened = [valuesObject.key] as LexConvertTypeMapping[LexConvertType][];
    return _convertTo(flattened, baseType);
  } else {
    throw Error('No conversion implemented for convert types');
  }
};

export {
  mappedSuggestionBuilder,
  convertToLex,
  convertFromLex,
};
