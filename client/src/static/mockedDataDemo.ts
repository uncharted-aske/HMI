import _ from 'lodash';
import { GroMEt2Graph } from 'research/gromet/tools/parser/GroMEt2Graph';

import * as Model from '@/types/typesModel';
import { getUtil } from '@/utils/FetchUtil';

export const staticFileURLs = [
  `${window.location.origin}/gromets/SimpleSIR_gromet_PetriNetClassic_metadata.json`,
  `${window.location.origin}/gromets/SimpleSIR_gromet_FunctionNetwork_metadata.json`,
];

// eslint-disable-next-line
export const buildInitialModelsList = ({ SIR_PN, SIR_FN }: any): Model.Model[] => {
  return [
    {
      id: 0,
      name: SIR_PN.name, // name should be the same across modeling frameworks
      metadata: {
        name: SIR_PN.name,
        description: '', // We are going to need a high-level description for each model.
      },
      modelGraph: [
        {
          file: '',
          type: Model.GraphTypes.PetriNetClassic,
          metadata: _.pick(GroMEt2Graph.parseGromet(SIR_PN), ['metadata']).metadata,
          graph: _.pick(GroMEt2Graph.parseGromet(SIR_PN), ['nodes', 'edges']),
        },
        {
          file: '',
          type: Model.GraphTypes.FunctionNetwork,
          metadata: _.pick(GroMEt2Graph.parseGromet(SIR_FN), ['metadata']).metadata,
          graph: _.pick(GroMEt2Graph.parseGromet(SIR_FN), ['nodes', 'edges']),
        },
      ],
    },
  ];
};

export const fetchInitialModelData = async (): Promise<Model.Model[]> => {
  const [SIR_PN, SIR_FN] = await Promise.all(
    staticFileURLs.map(url => getUtil(url)),
  );
  return buildInitialModelsList({ SIR_PN, SIR_FN });
};
