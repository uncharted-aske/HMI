/** Utilities to manipulate Donu Types */
import { ModelInterface, ModelInterfaceType } from '@/types/types';
import { DonuModelDefinition } from '@/types/typesDonu';

/** Transform a Donu Model to a ModelInterface */
export function donuToModel (donuModels: DonuModelDefinition[]): ModelInterface[] {
  return donuModels.map((model, index) => {
    return {
      metadata: {
        name: model.name ?? 'Donu ' + index,
        source: model.source.file,
      },
      graph: null,
      type: ModelInterfaceType.computational,
    } as ModelInterface;
  });
}
