import {
  ValueStateValue,
} from '@uncharted.software/lex/dist/lex';

import BinaryRelationState from '../BinaryRelationState';

import * as filtersUtil from '@/utils/FiltersUtil';
import * as lexUtil from '@/utils/LexUtil';
import { LexConvertType, QueryFieldEntry, Filter, Filters } from '@/types/typesLex';

export default class BasePill {
  public searchDisplay: string;
  public searchKey: string;
  public baseType: LexConvertType;
  public lexType: LexConvertType;
  public icon: string;
  public iconText: string;
  public displayFormatter: (v: string) => string

  /**
   * @param config - a CodeTable entry that defines a field configuration
   */
  constructor (config: QueryFieldEntry) {
    this.searchDisplay = config.searchDisplay;
    this.searchKey = config.field;
    this.baseType = config.baseType;
    this.lexType = config.lexType;
    this.icon = config.icon || null;
    this.iconText = config.iconText || '';

    this.displayFormatter = (v):string => v; // default pass-thru
  }

  makeOption (): ValueStateValue {
    return new ValueStateValue(this.searchDisplay, {
      searchKey: this.searchKey,
    });
  }

  makeIcon (): string {
    if (this.icon) {
      return `<i class="fa ${this.icon}">${this.iconText}</i>`;
    }
    return '<i class="fa fa-search"></i>';
  }

  makeBranch (): Error {
    throw new Error('Must be implemented by child');
  }

  /**
   * Set display formatter
   * @param formatter - formatter function
   */
  setFormatter (formatter: (v: string) => string): void {
    this.displayFormatter = formatter;
  }

  /**
   * Convert lex query state to filters query
   * @param lexItem - passed from new lex model on lex's 'query changed'
   * @param filters - Empty filters state
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  lex2Filters (lexItem: any, filters: Filters): void {
    const searchKey = lexItem.field.meta.searchKey;
    const relation = lexItem.relation.key;
    const operand = 'or';
    const isNot = (relation === 'not');
    const values = lexUtil.convertFromLex(lexItem.value, this.baseType);
    values.forEach(v => {
      filtersUtil.addSearchTerm(filters, searchKey, v, operand, isNot);
    });
  }

  /**
   * Convert filter query to lex query
   * @param clause - filter clause
   * @param selectedPill - A rich lex compatible object that contains the value and associated meta
   * @param lexQuery - One or more token values (an array of objects of boxed values) to display to overwrite the current lex query with
   */
  filters2Lex (clause: Filter, selectedPill: ValueStateValue, lexQuery: any[]): void {
    const values = lexUtil.convertToLex(clause.values, this.lexType);
    const isNot = clause.isNot;
    lexQuery.push({
      field: selectedPill,
      relation: isNot === true ? BinaryRelationState.IS_NOT : BinaryRelationState.IS,
      value: values.map(v => new ValueStateValue(v, {}, { displayKey: this.displayFormatter(String(v)) })),
    });
  }
}
