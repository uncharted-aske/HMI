/** Utilities to manipulate Donu Types */
import { ModelInterface } from '@/types/types';
import { DonuModelDefinition } from '@/types/typesDonu';

/** Transform a Donu Model to a ModelInterface */
export function donuToModel (models: DonuModelDefinition[]): ModelInterface[] {
  return models as unknown as ModelInterface[];
}
