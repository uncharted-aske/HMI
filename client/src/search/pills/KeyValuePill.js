import { Lex, TransitionFactory, ValueStateValue } from '@uncharted.software/lex/dist/lex';

import BinaryRelationState from '../BinaryRelationState';
import MappedOptionState from '../MappedOptionState';
import BasePill from './BasePill';

import lexUtil from '../../utils/LexUtil';

/**
 * Used for static suggestions in key-value format. For
 * example polarities, statement-polarities...etc
 */
export default class KeyValuePill extends BasePill {
  constructor (config, map, msg) {
    super(config);
    this.branchConfig = lexUtil.mappedSuggestionBuilder(msg, true, map);
    this.keyMap = map;
  }

  makeBranch () {
    return Lex.from('relation', BinaryRelationState, TransitionFactory.valueMetaCompare({ searchKey: this.searchKey }))
      .to('value', MappedOptionState, this.branchConfig);
  }

  /**
   * Convert filter query to lex query
   * @param {object} clause - filter clause
   * @param {object} selectedPill - A rich lex compatible object that contains the value and associated meta
   * @param {array} lexQuery
   */
  filters2Lex (clause, selectedPill, lexQuery) {
    const isNot = clause.isNot;
    lexQuery.push({
      field: selectedPill,
      relation: isNot ? BinaryRelationState.IS_NOT : BinaryRelationState.IS,
      value: clause.values.map((v) => new ValueStateValue(v, {}, { displayKey: this.displayFormatter(this.keyMap[v]) })),
    });
  }
}
