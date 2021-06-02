/** Utilities to manipulate Donu Types */
import { ModelInterface, ModelInterfaceType } from '@/types/types';
import * as Donu from '@/types/typesDonu';

/** Transform a Donu Model to a ModelInterface */
export function donuToModel (donuModels: Donu.ModelDefinition[]): ModelInterface[] {
  return donuModels.map((model, index) => {
    return {
      metadata: {
        name: model.name ?? 'Donu ' + index,
        source: model.source.file,
        type: model.type,
      },
      graph: null,
      type: ModelInterfaceType.computational,
    } as ModelInterface;
  });
}
