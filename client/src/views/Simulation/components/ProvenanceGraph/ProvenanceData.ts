import { GraphInterface } from '@/types/typesGraphs';

export abstract class ProvenanceData {
    // Mocked up data for each case:
    static readonly SINGLE_MODEL_CONDENSED: GraphInterface = ({
      nodes: [{ id: 'Box 0', label: '', parent: null },
        { id: 'Select', label: 'Select', role: ['Operation'], parent: 'Box 0', nodeType: 'Author and Time' },
        { id: 'Box 1', label: '', parent: 'Box 0' },
        { id: 'Execute 1', label: 'Execute', role: ['Operation'], parent: 'Box 1' },
        { id: 'Edit 1', label: 'Edit', role: ['Operation'], parent: 'Box 1' },
        { id: 'Box 2', label: '', parent: 'Box 0' },
        { id: 'Execute 2', label: 'Execute', role: ['Operation'], parent: 'Box 2' },
        { id: 'Edit 2', label: 'Edit', role: ['Operation'], parent: 'Box 2' },
        { id: 'Box 3', label: '', parent: 'Box 0' },
        { id: 'Execute 3', label: 'Execute', role: ['Operation'], parent: 'Box 3' },
        { id: 'Edit 3', label: 'Edit', role: ['Operation'], parent: 'Box 3' },
      ],
      edges: [{ source: 'Select', target: 'Execute 1' },
        { source: 'Select', target: 'Edit 1' },
        { source: 'Edit 1', target: 'Execute 1' },
        { source: 'Select', target: 'Execute 2' },
        { source: 'Edit 1', target: 'Edit 2' },
        { source: 'Edit 2', target: 'Execute 2' },
        { source: 'Select', target: 'Execute 3' },
        { source: 'Edit 2', target: 'Edit 3' },
        { source: 'Edit 3', target: 'Execute 3' },
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
      edges: [{ source: 'Models', target: 'Select' },
        { source: 'Select', target: 'Model:v0' },
        { source: 'Select', target: 'Param:v0' },
        { source: 'Model:v0', target: 'Execute' },
        { source: 'Param:v0', target: 'Edit' },
        { source: 'Edit', target: 'Param:v1' },
        { source: 'Param:v1', target: 'Execute' },
        { source: 'Execute', target: 'Variables:v1' },
      ],
    });

    static readonly MULTI_MODEL_CONDENSED: GraphInterface = ({
      nodes: [{ id: 'Select', label: 'Select', role: ['Operation'] },
        { id: 'Execute 1', label: 'Execute', role: ['Operation'] },
        { id: 'Edit 1', label: 'Edit', role: ['Operation'] },
        { id: 'Edit 2', label: 'Edit', role: ['Operation'] },
      ],
      edges: [{ source: 'Select', target: 'Edit 1' },
        { source: 'Edit 1', target: 'Execute 1' },
        { source: 'Select', target: 'Edit 2' },
        { source: 'Edit 2', target: 'Execute 1' },
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
      edges: [{ source: 'Models', target: 'Select' },
        { source: 'Select', target: 'Model 1' },
        { source: 'Select', target: 'Param 1:v0' },
        { source: 'Select', target: 'Model 2' },
        { source: 'Select', target: 'Param 2:v0' },
        { source: 'Param 1:v0', target: 'Edit 1' },
        { source: 'Edit 1', target: 'Param 1:v1' },
        { source: 'Param 2:v0', target: 'Edit 2' },
        { source: 'Edit 2', target: 'Param 2:v1' },
        { source: 'Model 1', target: 'Execute' },
        { source: 'Param 1:v1', target: 'Execute' },
        { source: 'Model 2', target: 'Execute' },
        { source: 'Param 2:v1', target: 'Execute' },
        { source: 'Execute', target: 'Variables 1' },
        { source: 'Execute', target: 'Variables 2' },
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
