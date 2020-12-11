import { ValueStateValue, RelationState } from '@uncharted.software/lex/dist/lex';

const options = [
  new ValueStateValue('is', {}, { displayKey: 'is' }),
];

export default class SingleRelationState extends RelationState {
  static get IS (): ValueStateValue {
    return options[0];
  }

  constructor (config: RelationState.config) {
    if (config.name === undefined) {
      config.name = 'Choose a search option';
    }
    // TODO: Generate Lex types to retrieve type for RelationState.config.options
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    config.options = () => options;
    super(config);
  }
}
