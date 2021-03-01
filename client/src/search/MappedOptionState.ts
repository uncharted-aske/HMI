import _ from 'lodash';
import { ValueState } from '@uncharted.software/lex/dist/lex';
import { MappedOptionStateConfig, MappedOptions } from '@/types/typesLex';

/**
 * Leverage boxed/unboxed values to do key=>value maps
 *
 * Takes in an additional config.mappedOptions to perform lookups
 */
export default class MappedOptionState extends ValueState {
  private mappedOptions: MappedOptions;

  constructor (config: MappedOptionStateConfig) {
    super(config);

    this.mappedOptions = config.mappedOptions;
  }

  // Override Lex's ValueState.unformatUnboxedValue method
  unformatUnboxedValue (displayKey: string): string {
    return _.invert(this.mappedOptions)[displayKey] || displayKey;
  }

  // Override Lex's ValueState.formatUnboxedValue method
  formatUnboxedValue (key: string): string {
    return this.mappedOptions[key] || key;
  }
}
