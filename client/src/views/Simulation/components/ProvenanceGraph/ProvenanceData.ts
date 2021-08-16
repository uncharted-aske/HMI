import { GraphInterface } from '@/types/typesGraphs';

export abstract class ProvenanceData {
    // Mocked up data for each case:
    static readonly SINGLE_MODEL_CONDENSED: GraphInterface = ({
      nodes: [{ id: 'Select', label: 'Select', role: ['Operation'] },
        { id: 'Execute 1', label: 'Execute', role: ['Operation'] },
        { id: 'Edit 1', label: 'Edit', role: ['Operation'] },
      ],
      edges: [{ id: 'Edge 1', source: 'Select', target: 'Execute 1' },
        { id: 'Edge 2', source: 'Select', target: 'Edit 1' },
        { id: 'Edge 3', source: 'Edit 1', target: 'Execute 1' },
      ],
    });

    static readonly SINGLE_MODEL_EXPANDED: GraphInterface = ({
      nodes: [{ id: 'Select', label: 'Select', role: ['Operation'] },
        { id: 'Edit', label: 'Edit', role: ['Operation'] },
        { id: 'Execute', label: 'Execute', role: ['Operation'] },
        { id: 'Models', label: 'Models', role: ['Data'] },
        { id: 'Model:v0', label: 'Model:v0', role: ['Data'] },
        { id: 'Param:v0', label: 'Param:v0', role: ['Data'] },
        { id: 'Param:v1', label: 'Param:v1', role: ['Data'] },
        { id: 'Variables:v1', label: 'Variables:v1', role: ['Data'] },
      ],
      edges: [{ id: 'Edge 1', source: 'Models', target: 'Select' },
        { id: 'Edge 2', source: 'Select', target: 'Model:v0' },
        { id: 'Edge 3', source: 'Select', target: 'Param:v0' },
        { id: 'Edge 4', source: 'Model:v0', target: 'Execute' },
        { id: 'Edge 5', source: 'Param:v0', target: 'Edit' },
        { id: 'Edge 6', source: 'Edit', target: 'Param:v1' },
        { id: 'Edge 7', source: 'Param:v1', target: 'Execute' },
        { id: 'Edge 8', source: 'Execute', target: 'Variables:v1' },
      ],
    });

    static readonly MULTI_MODEL_CONDENSED: GraphInterface = ({
      nodes: [{ id: 'Select', label: 'Select', role: ['Operation'] },
        { id: 'Execute 1', label: 'Execute', role: ['Operation'] },
        { id: 'Edit 1', label: 'Edit', role: ['Operation'] },
        { id: 'Edit 2', label: 'Edit', role: ['Operation'] },
      ],
      edges: [{ id: 'Edge 1', source: 'Select', target: 'Edit 1' },
        { id: 'Edge 2', source: 'Edit 1', target: 'Execute 1' },
        { id: 'Edge 3', source: 'Select', target: 'Edit 2' },
        { id: 'Edge 4', source: 'Edit 2', target: 'Execute 1' },
      ],
    });

    static readonly MULTI_MODEL_EXPANDED: GraphInterface = ({
      nodes: [{ id: 'Select', label: 'Select', role: ['Operation'] },
        { id: 'Edit 1', label: 'Edit', role: ['Operation'] },
        { id: 'Edit 2', label: 'Edit', role: ['Operation'] },
        { id: 'Execute', label: 'Execute', role: ['Operation'] },
        { id: 'Models', label: 'Models', role: ['Data'] },
        { id: 'Model 1', label: 'Model 1', role: ['Data'] },
        { id: 'Model 2', label: 'Model 2', role: ['Data'] },
        { id: 'Param 1:v0', label: 'Param 1:v0', role: ['Data'] },
        { id: 'Param 1:v1', label: 'Param 1:v1', role: ['Data'] },
        { id: 'Param 2:v0', label: 'Param 2:v0', role: ['Data'] },
        { id: 'Param 2:v1', label: 'Param 2:v1', role: ['Data'] },
        { id: 'Variables 1', label: 'Variables:v1', role: ['Data'] },
        { id: 'Variables 2', label: 'Variables:v2', role: ['Data'] },
      ],
      edges: [{ id: 'Edge 1', source: 'Models', target: 'Select' },
        { id: 'Edge 2', source: 'Select', target: 'Model 1' },
        { id: 'Edge 3', source: 'Select', target: 'Param 1:v0' },
        { id: 'Edge 4', source: 'Select', target: 'Model 2' },
        { id: 'Edge 5', source: 'Select', target: 'Param 2:v0' },
        { id: 'Edge 6', source: 'Param 1:v0', target: 'Edit 1' },
        { id: 'Edge 7', source: 'Edit 1', target: 'Param 1:v1' },
        { id: 'Edge 8', source: 'Param 2:v0', target: 'Edit 2' },
        { id: 'Edge 9', source: 'Edit 2', target: 'Param 2:v1' },
        { id: 'Edge 10', source: 'Model 1', target: 'Execute' },
        { id: 'Edge 11', source: 'Param 1:v1', target: 'Execute' },
        { id: 'Edge 12', source: 'Model 2', target: 'Execute' },
        { id: 'Edge 13', source: 'Param 2:v1', target: 'Execute' },
        { id: 'Edge 14', source: 'Execute', target: 'Variables 1' },
        { id: 'Edge 15', source: 'Execute', target: 'Variables 2' },
      ],
    });
}

export enum ProvenanceLayoutInterfaceType {
  condensed = 'condensed',
  expanded = 'expanded',
}

export interface ProvenanceLayoutInterface {
  name: string,
  id: ProvenanceLayoutInterfaceType,
}
