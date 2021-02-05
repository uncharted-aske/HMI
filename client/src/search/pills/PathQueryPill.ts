import {
  Lex,
  TransitionFactory,
  TextEntryState,
  LabelState,
  ValueStateValue,
} from '@uncharted.software/lex/dist/lex';
import { StateTemplate } from '@uncharted.software/lex/src/lib/state.js';

import BetweenRelationState from '../BetweenRelationState';
import BasePill from './BasePill';
import { addSearchTerm } from '@/utils/FiltersUtil';
import { Filter, Filters } from '@/types/types';

export default class RangePill extends BasePill {
  makeBranch (): StateTemplate {
    return Lex.from('relation', BetweenRelationState, TransitionFactory.valueMetaCompare({ searchKey: this.searchKey }))
      .branch(
        Lex.from('value', TextEntryState, TransitionFactory.valueKeyIs('from'))
          .to(LabelState, { label: 'to' })
          .to('secondaryValue', TextEntryState),
      );
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  lex2Filters (lexItem: any, filters: Filters): void {
    const relation = lexItem.relation.key;
    const operand = 'or';
    const isNot = (relation === 'not');
    const primaryValue = lexItem.value.key;
    const secondaryValue = lexItem.secondaryValue.key;
    // eslint-disable-next-line
    // @ts-ignore
    addSearchTerm(filters, this.searchKey, [primaryValue, secondaryValue], operand, isNot);
  }

  /**
   * Convert filter query to lex query
   * @param clause - filter clause
   * @param selectedPill - A rich lex compatible object that contains the value and associated meta
   * @param lexQuery - One or more token values (an array of objects of boxed values) to display to overwrite the current lex query with
   */
  filters2Lex (clause: Filter, selectedPill: ValueStateValue, lexQuery: any[]): void {
    const values = clause.values;
    lexQuery.push({
      field: selectedPill,
      relation: BetweenRelationState.BETWEEN,
      value: new ValueStateValue(values[0][0]),
      secondaryValue: new ValueStateValue(values[0][1]),
    });
  }
}
