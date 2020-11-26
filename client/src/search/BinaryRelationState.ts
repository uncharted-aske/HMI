import { ValueStateValue, RelationState } from '@uncharted.software/lex/dist/lex';

const options = [
  new ValueStateValue('is', {}, { displayKey: 'is' }),
  new ValueStateValue('not', {}, { displayKey: 'not' }),
];

export default class BinaryRelationState extends RelationState {
  /**
   * The "is" option.
   */
  static get IS (): ValueStateValue {
    return options[0];
  }

  /**
   * The "is not" option.
   */
  static get IS_NOT (): ValueStateValue {
    return options[1];
  }

  // TODO: Generate Lex types to retrieve type for RelationState.config
  constructor (config: RelationState.config) {
    if (config.name === undefined) config.name = 'Choose a search relation';
    // TODO: Generate Lex types to retrieve type for RelationState.config.options
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    config.options = function () {
      return options;
    };
    super(config);
  }
}
