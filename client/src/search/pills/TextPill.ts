import { Lex, TransitionFactory, TextEntryState } from '@uncharted.software/lex/dist/lex';
import BasePill from '@/search/pills/BasePill';
import SingleRelationState from '@/search/SingleRelationState';

import { StateTemplate } from '@uncharted.software/lex/src/lib/state.js';

export default class TextPill extends BasePill {
  makeBranch (): StateTemplate {
    return Lex.from('relation', SingleRelationState, TransitionFactory.valueMetaCompare({ searchKey: this.searchKey }))
      .branch(
        Lex.from('value', TextEntryState, { multivalue: true }),
      );
  }
}
