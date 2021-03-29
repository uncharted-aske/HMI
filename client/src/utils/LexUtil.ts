import _ from 'lodash';
import { Lex, ValueState, ValueStateValue } from '@uncharted.software/lex/dist/lex';
import { Filters, MappedOptions, MappedOptionStateConfig, LexConvertType, LexConvertTypeMapping } from '@/types/typesLex';
import * as filtersUtil from '@/utils/FiltersUtil';

const SUGGESTIONS_LIMIT = 10;

export const initializeLex = (config: {
  pills: any[],
  onChange: (newFilters: Filters) => void,
  placeholder?: string,
  fieldName?: string,
  suggestionLimit?: number,
}): Lex => {
  const { pills, onChange, placeholder, fieldName, suggestionLimit } = config;

  const language = Lex.from('field', ValueState, {
    name: fieldName ?? 'Choose a field to search',
    suggestions: _.sortBy(pills, p => p.searchDisplay).map(pill =>
      pill.makeOption(),
    ),
    suggestionLimit: suggestionLimit ?? SUGGESTIONS_LIMIT,
    icon: v => {
      if (_.isNil(v)) return '<i class="fas fa-search"></i>';
      const pill = pills.find(
        pill => pill.searchKey === v.meta.searchKey,
      );
      return pill.makeIcon();
    },
  }).branch(...pills.map(pill => pill.makeBranch()));

  // Initialize lex instance
  const lex = new Lex({
    language: language,
    tokenXIcon: '<i class="fas fa-times"></i>',
    placeholder: placeholder ?? 'Search...',
  });

  lex.on('query changed', (...args /* [newModel, oldModel, newUnboxedModel, oldUnboxedModel, nextTokenStarted] */) => {
    const newModel = args[0];
    const newFilters = filtersUtil.newFilters();

    newModel.forEach(item => {
      const pill = pills.find(
        pill => pill.searchKey === item.field.meta.searchKey,
      );
      if (!_.isNil(pill)) {
        pill.lex2Filters(item, newFilters);
      }
    });

    onChange(newFilters);
  });

  return lex;
};

export const setPills = (config : {lex: Lex, pills: any[], filters: Filters}): void => {
  const { lex, pills, filters } = config;
  if (!lex) return;
  const lexQuery = [];
  filters.clauses.forEach(clause => {
    const pill = pills.find(pill => pill.searchKey === clause.field);
    if (!_.isNil(pill)) {
      const selectedPill = pill.makeOption();
      pill.filters2Lex(clause, selectedPill, lexQuery);
    }
  });
  lex.setQuery(lexQuery, false);
};

/**
 * Suggestion builder for MappedOptionState
 *
 * @param message - assistant message
 * @param isMultiValue - if state allows multiple values
 * @param mappedOptions - Suggestions to be used as mapped options
 */
export const mappedSuggestionBuilder = (message: string, isMultiValue: boolean, mappedOptions: MappedOptions): MappedOptionStateConfig => {
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
};

const _convertTo = (values: LexConvertTypeMapping[LexConvertType][], convertType: LexConvertType): LexConvertTypeMapping[LexConvertType][] => {
  if (convertType === 'integer') {
    return values.map(r => +r) as number[];
  } else if (convertType === 'string') {
    return values.map(r => '' + r) as string[];
  } else {
    throw Error('No conversion implemented for convert types');
  }
};

export const convertToLex = (values: LexConvertTypeMapping[LexConvertType][], lexType: LexConvertType): LexConvertTypeMapping[LexConvertType][] => {
  return _convertTo(values, lexType);
};

export const convertFromLex = (values: unknown, baseType: LexConvertType): LexConvertTypeMapping[LexConvertType][] => {
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
    // Handle lex single typed values
    const valuesArray = [values] as any;
    const flattened = valuesArray.map(v => v.key) as LexConvertTypeMapping[LexConvertType][];
    return _convertTo(flattened, baseType);
  }
};
