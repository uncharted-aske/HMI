import { GroMEt2Graph } from 'research/gromet/tools/parser/GroMEt2Graph';

import * as Model from '@/types/typesModel';
import * as Graphs from '@/types/typesGraphs';
import { getUtil } from '@/utils/FetchUtil';

export const staticFileURLs = [
  `${window.location.origin}/gromets/SimpleSIR_gromet_PetriNetClassic_metadata.json`,
  `${window.location.origin}/gromets/SimpleSIR_gromet_FunctionNetwork_metadata.json`,
  `${window.location.origin}/gromets/SEIR_gromet_PetriNetClassic_metadata.json`,
  `${window.location.origin}/gromets/SEIRD_gromet_PetriNetClassic_metadata.json`,
  `${window.location.origin}/gromets/SIRD_gromet_PetriNetClassic_metadata.json`,
  `${window.location.origin}/gromets/SIR_AlgebraicJulia.json`,
];

// eslint-disable-next-line
export const buildInitialModelsList = ({ SIR_PN, SIR_FN, SEIR_PN, SEIRD_PN, SIRD_PN }: any): Model.Model[] => {
  const SIR_PN_PARSED = GroMEt2Graph.parseGromet(SIR_PN);
  const SIR_FN_PARSED = GroMEt2Graph.parseGromet(SIR_FN);
  const SEIR_PN_PARSED = GroMEt2Graph.parseGromet(SEIR_PN);
  const SEIRD_PN_PARSED = GroMEt2Graph.parseGromet(SEIRD_PN);
  const SIRD_PN_PARSED = GroMEt2Graph.parseGromet(SIRD_PN);

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
          metadata: SIR_PN.metadata,
          graph: {
            edges: SIR_PN_PARSED.edges as Graphs.GraphEdgeInterface[],
            nodes: SIR_PN_PARSED.nodes as unknown as Graphs.GraphNodeInterface[],
          },
        },
        {
          file: '',
          type: Model.GraphTypes.FunctionNetwork,
          metadata: SIR_FN.metadata,
          graph: {
            edges: SIR_FN_PARSED.edges as Graphs.GraphEdgeInterface[],
            nodes: SIR_FN_PARSED.nodes as unknown as Graphs.GraphNodeInterface[],
          },
        },
      ],
    },
    {
      id: 1,
      name: SEIR_PN.name, // name should be the same across modeling frameworks
      metadata: {
        name: SEIR_PN.name,
        description: '', // We are going to need a high-level description for each model.
      },
      modelGraph: [
        {
          file: '',
          type: Model.GraphTypes.PetriNetClassic,
          metadata: SEIR_PN.metadata,
          graph: {
            edges: SEIR_PN_PARSED.edges as Graphs.GraphEdgeInterface[],
            nodes: SEIR_PN_PARSED.nodes as unknown as Graphs.GraphNodeInterface[],
          },
        },
      ],
    },
    {
      id: 2,
      name: SEIRD_PN.name, // name should be the same across modeling frameworks
      metadata: {
        name: SEIRD_PN.name,
        description: '', // We are going to need a high-level description for each model.
      },
      modelGraph: [
        {
          file: '',
          type: Model.GraphTypes.PetriNetClassic,
          metadata: SEIRD_PN.metadata,
          graph: {
            edges: SEIRD_PN_PARSED.edges as Graphs.GraphEdgeInterface[],
            nodes: SEIRD_PN_PARSED.nodes as unknown as Graphs.GraphNodeInterface[],
          },
        },
      ],
    },
    {
      id: 3,
      name: SIRD_PN.name, // name should be the same across modeling frameworks
      metadata: {
        name: SIRD_PN.name,
        description: '', // We are going to need a high-level description for each model.
      },
      modelGraph: [
        {
          file: '',
          type: Model.GraphTypes.PetriNetClassic,
          metadata: SEIRD_PN.metadata,
          graph: {
            edges: SIRD_PN_PARSED.edges as Graphs.GraphEdgeInterface[],
            nodes: SIRD_PN_PARSED.nodes as unknown as Graphs.GraphNodeInterface[],
          },
        },
      ],
    },
  ];
};

export const fetchInitialModelData = async (): Promise<Model.Model[]> => {
  const [SIR_PN, SIR_FN, SEIR_PN, SEIRD_PN, SIRD_PN] = await Promise.all(
    staticFileURLs.map(url => getUtil(url)),
  );
  return buildInitialModelsList({ SIR_PN, SIR_FN, SEIR_PN, SEIRD_PN, SIRD_PN });
};
