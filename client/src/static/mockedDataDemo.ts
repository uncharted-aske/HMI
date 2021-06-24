import { GroMEt2Graph } from 'research/gromet/tools/parser/GroMEt2Graph';

import * as Model from '@/types/typesModel';
import * as Graphs from '@/types/typesGraphs';
import { getUtil } from '@/utils/FetchUtil';

export const staticFileURLs = [
  `${window.location.origin}/gromets/SimpleSIR_gromet_PetriNetClassic_metadata.json`,
  `${window.location.origin}/gromets/SimpleSIR_gromet_FunctionNetwork_metadata.json`,
];

// eslint-disable-next-line
export const buildInitialModelsList = ({ SIR_PN, SIR_FN }: any): Model.Model[] => {
  const PN = GroMEt2Graph.parseGromet(SIR_PN);
  const FN = GroMEt2Graph.parseGromet(SIR_FN);
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
          type: 'PetriNetClassic',
          metadata: PN.metadata,
          graph: {
            edges: PN.edges as Graphs.GraphEdgeInterface[],
            nodes: PN.nodes as unknown as Graphs.GraphNodeInterface[],
          },
        },
        {
          file: '',
          type: 'FunctionNetwork',
          metadata: FN.metadata,
          graph: {
            edges: FN.edges as Graphs.GraphEdgeInterface[],
            nodes: FN.nodes as unknown as Graphs.GraphNodeInterface[],
          },
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
