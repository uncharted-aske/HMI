/** Utilities to manipulate Donu Types */
import * as Donu from '@/types/typesDonu';
import * as Model from '@/types/typesModel';

/** Transform a Donu Model to a Model */
export const donuToModel = (donuModels: Donu.ModelDefinition[]): Model.Model[] => {
  // TODO: This is just a mockup. Once the demo is over and we
  //       fetch the real data from DONU, this should be replaced.
  return donuModels.map((model, index) => {
    return {
      id: index,
      metadata: {
        name: model.name ?? 'Donu ' + index,
      },
      modelGraph: null,
    } as Model.Model;
  });
};

/** Is the Graph a GroMET */
export const isGraphAGroMET = (graph: Model.Graph): boolean => {
  return [Donu.Type.GROMET_PNC/* , Donu.Type.GROMET_PRT */].includes(graph.donuType);
};
