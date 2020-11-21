import { Lex, TransitionFactory, ValueStateValue } from '@uncharted.software/lex/dist/lex';
import { StateTemplate } from '@uncharted.software/lex/src/lib/state.js';

import BinaryRelationState from '../BinaryRelationState';
import MappedOptionState from '../MappedOptionState';
import BasePill from './BasePill';

import * as lexUtil from '../../utils/LexUtil';
import { QueryFieldEntry, MappedOptions, MappedOptionStateConfig, Filter } from '@/types/types';

/**
 * Used for static suggestions in key-value format. For
 * example polarities, statement-polarities...etc
 */
export default class KeyValuePill extends BasePill {
  private branchConfig: MappedOptionStateConfig;
  private keyMap: MappedOptions;

  constructor (config: QueryFieldEntry, map: MappedOptions, msg: string) {
    super(config);
    this.branchConfig = lexUtil.mappedSuggestionBuilder(msg, true, map);
    this.keyMap = map;
  }

  makeBranch (): StateTemplate {
    return Lex.from('relation', BinaryRelationState, TransitionFactory.valueMetaCompare({ searchKey: this.searchKey }))
      .to('value', MappedOptionState, this.branchConfig);
  }

  /**
   * Convert filter query to lex query
   * @param clause - filter clause
   * @param selectedPill - A rich lex compatible object that contains the value and associated meta
   * @param lexQuery
   */
  filters2Lex (clause: Filter, selectedPill, lexQuery): void {
    const isNot = clause.isNot;
    lexQuery.push({
      field: selectedPill,
      relation: isNot ? BinaryRelationState.IS_NOT : BinaryRelationState.IS,
      value: clause.values.map((v) => new ValueStateValue(v, {}, { displayKey: this.displayFormatter(this.keyMap[v]) })),
    });
  }
}
