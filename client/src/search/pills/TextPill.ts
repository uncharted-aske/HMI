import { Lex, TransitionFactory, TextEntryState } from '@uncharted.software/lex/dist/lex';
import BasePill from '@/search/pills/BasePill';
import SingleRelationState from '@/search/SingleRelationState';

import { StateTemplate } from '@uncharted.software/lex/src/lib/state.js';

import { QueryFieldEntry } from '@/types/types';

export default class TextPill extends BasePill {
  private args: {multiValue: boolean};

  constructor (config: QueryFieldEntry, args?: {multiValue?: boolean}) {
    super(config);
    this.args = { ...{ multiValue: true }, ...args };
  }

  makeBranch (): StateTemplate {
    return Lex.from('relation', SingleRelationState, TransitionFactory.valueMetaCompare({ searchKey: this.searchKey }))
      .branch(
        Lex.from('value', TextEntryState, { multivalue: this.args.multiValue }),
      );
  }
}
