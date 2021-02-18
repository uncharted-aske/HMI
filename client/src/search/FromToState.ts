import { ValueStateValue, RelationState } from '@uncharted.software/lex/dist/lex';

const options = [
  new ValueStateValue('from', {}, { displayKey: 'from' }),
];

export default class FromToState extends RelationState {
  /**
   * The "is" option.
   */
  static get FROMTO (): ValueStateValue {
    return options[0];
  }

  // TODO: Generate Lex types to retrieve type for RelationState.config
  constructor (config: RelationState.config) {
    if (config.name === undefined) config.name = 'Choose a search option';
    // TODO: Generate Lex types to retrieve type for RelationState.config.options
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    config.options = function () {
      return options;
    };
    super(config);
  }
}
