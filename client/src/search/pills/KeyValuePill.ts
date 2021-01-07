import { Lex, TransitionFactory, ValueStateValue } from '@uncharted.software/lex/dist/lex';
import { StateTemplate } from '@uncharted.software/lex/src/lib/state.js';

import BinaryRelationState from '../BinaryRelationState';
import SingleRelationState from '../SingleRelationState';
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
  private args: {single: boolean, multiValue: boolean};

  constructor (config: QueryFieldEntry, map: MappedOptions, msg: string, args?: {single?: boolean, multiValue?: boolean}) {
    super(config);
    this.args = { ...{ single: false, multiValue: true }, ...args };
    this.branchConfig = lexUtil.mappedSuggestionBuilder(msg, this.args.multiValue, map);
    this.keyMap = map;
  }

  makeBranch (): StateTemplate {
    return Lex.from(
      'relation',
      this.args.single ? SingleRelationState : BinaryRelationState,
      TransitionFactory.valueMetaCompare({ searchKey: this.searchKey }),
    )
      .to('value', MappedOptionState, this.branchConfig);
  }

  /**
   * Convert filter query to lex query
   * @param clause - filter clause
   * @param selectedPill - A rich lex compatible object that contains the value and associated meta
   * @param lexQuery - One or more token values (an array of objects of boxed values) to display to overwrite the current lex query with
   */
  filters2Lex (clause: Filter, selectedPill: ValueStateValue, lexQuery: any[]): void {
    const isNot = clause.isNot;
    lexQuery.push({
      field: selectedPill,
      relation: !this.args.single && isNot ? BinaryRelationState.IS_NOT : BinaryRelationState.IS,
      value: clause.values.map((v) => new ValueStateValue(v, {}, { displayKey: this.displayFormatter(this.keyMap[v]) })),
    });
  }
}
