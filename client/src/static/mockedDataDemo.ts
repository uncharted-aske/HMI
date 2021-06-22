import _ from 'lodash';

import { ModelInterface } from '@/types/types';
import { GroMEt2Graph } from 'research/gromet/tools/parser/GroMEt2Graph';
import { getUtil } from '@/utils/FetchUtil';

export const staticFileURLs = [
    `${window.location.origin}/gromets/SimpleSIR_gromet_PetriNetClassic_metadata.json`,
    `${window.location.origin}/gromets/SimpleSIR_gromet_FunctionNetwork_metadata.json`,
];

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const fetchInitialModelData = async () => {
  const [
    SIR_PN,
    SIR_FN,
  ] = await Promise.all(
    staticFileURLs.map(url => getUtil(url, {})),
  );

  return {
    SIR_PN,
    SIR_FN,
  };
};

export const buildInitialModelsList = ({
  SIR_PN,
  SIR_FN,
}): ModelInterface[] => {
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
          metadata: _.pick(GroMEt2Graph.parseGromet(SIR_PN), ['metadata']).metadata,
          graph: _.pick(GroMEt2Graph.parseGromet(SIR_PN), ['nodes', 'edges']),
        },
        {
          file: '',
          type: 'FunctionNetwork',
          metadata: _.pick(GroMEt2Graph.parseGromet(SIR_FN), ['metadata']).metadata,
          graph: _.pick(GroMEt2Graph.parseGromet(SIR_FN), ['nodes', 'edges']),
        },
      ],
    },
  ];
};
