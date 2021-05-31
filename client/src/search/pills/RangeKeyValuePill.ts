import { invert } from 'lodash';
import {
  LabelState,
  Lex,
  TransitionFactory,
  ValueStateValue,
} from '@uncharted.software/lex/dist/lex';
import { StateTemplate } from '@uncharted.software/lex/src/lib/state.js';

import BetweenRelationState from '../BetweenRelationState';
import MappedOptionState from '../MappedOptionState';
import BasePill from './BasePill';
import { addSearchTerm } from '@/utils/FiltersUtil';
import * as lexUtil from '../../utils/LexUtil';

import { QueryFieldEntry, MappedOptions, MappedOptionStateConfig, Filter, Filters } from '@/types/typesLex';

export default class RangeKeyValuePill extends BasePill {
  private branchConfig: MappedOptionStateConfig;
  private keyMap: MappedOptions;
  private keyMapInverted: MappedOptions;
  private args: {single: boolean, multiValue: boolean};

  constructor (config: QueryFieldEntry, map: any[], msg: string) {
    super(config);
    this.args = { ...{ single: true, multiValue: false } };
    this.branchConfig = lexUtil.mappedSuggestionBuilder(msg, this.args.multiValue, map as unknown as MappedOptions);
    this.keyMap = map as unknown as MappedOptions;
    this.keyMapInverted = invert(this.keyMap);
  }

  makeBranch (): StateTemplate {
    return Lex.from('relation', BetweenRelationState, TransitionFactory.valueMetaCompare({ searchKey: this.searchKey }))
      .branch(
        Lex.from('value', MappedOptionState, { ...TransitionFactory.valueKeyIs('between'), ...this.branchConfig })
          .to(LabelState, { label: 'and' })
          .to('secondaryValue', MappedOptionState, this.branchConfig),
      );
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  lex2Filters (lexItem: any, filters: Filters): void {
    const relation = lexItem.relation.key;
    const operand = 'or';
    const isNot = (relation === 'not');
    const primaryValue = this.keyMap[lexItem.value.key];
    const secondaryValue = this.keyMap[lexItem.secondaryValue.key];
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
    const primaryValue = Number(this.keyMapInverted[values[0][0]]);
    const secondaryValue = Number(this.keyMapInverted[values[0][1]]);
    if (primaryValue !== undefined && secondaryValue !== undefined) {
      lexQuery.push({
        field: selectedPill,
        relation: BetweenRelationState.BETWEEN,
        value: new ValueStateValue(primaryValue),
        secondaryValue: new ValueStateValue(secondaryValue),
      });
    }
  }
}
