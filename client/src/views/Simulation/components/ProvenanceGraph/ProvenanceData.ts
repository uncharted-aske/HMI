import { GraphInterface } from '@/types/typesGraphs';

export abstract class ProvenanceData {
    // Mocked up data for each case:
    static readonly SINGLE_MODEL_CONDENSED: GraphInterface = ({
      nodes: [{ id: 'Box 0', label: '', parent: null },
        { id: 'Select', label: 'Select', role: ['Operation'], parent: 'Box 0', tooltip: '2021-08-27T11:00:00' },
        { id: 'Box 1', label: '', parent: 'Box 0' },
        { id: 'Edit 1', label: 'Edit', role: ['Operation'], parent: 'Box 1', tooltip: '2021-08-27T11:01:00' },
        { id: 'Execute 1', label: 'Execute', role: ['Operation'], parent: 'Box 1', tooltip: '2021-08-27T11:02:00' },
        { id: 'Box 2', label: '', parent: 'Box 0' },
        { id: 'Edit 2', label: 'Edit', role: ['Operation'], parent: 'Box 2', tooltip: '2021-08-27T11:03:00' },
        { id: 'Execute 2', label: 'Execute', role: ['Operation'], parent: 'Box 2', tooltip: '2021-08-27T11:04:00' },
        { id: 'Box 3', label: '', parent: 'Box 0' },
        { id: 'Edit 3', label: 'Edit', role: ['Operation'], parent: 'Box 3', tooltip: '2021-08-27T11:05:00' },
        { id: 'Execute 3', label: 'Execute', role: ['Operation'], parent: 'Box 3', tooltip: '2021-08-27T11:06:00' },
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

    static readonly SINGLE_MODEL_DETAILED: GraphInterface = ({
      nodes: [{ id: 'Box 0', label: '', parent: null },
        { id: 'Select', label: 'Select', role: ['Operation'], parent: 'Box 0', tooltip: '2021-08-27T11:00:00' },
        { id: 'Box 1', label: '', parent: 'Box 0' },
        { id: 'Edit 1', label: 'Edit', role: ['Operation'], parent: 'Box 1', tooltip: '2021-08-27T11:01:00' },
        { id: 'Execute 1', label: 'Execute', role: ['Operation'], parent: 'Box 1', tooltip: '2021-08-27T11:02:00' },
        { id: 'Box 2', label: '', parent: 'Box 0' },
        { id: 'Edit 2', label: 'Edit', role: ['Operation'], parent: 'Box 2', tooltip: '2021-08-27T11:03:00' },
        { id: 'Execute 2', label: 'Execute', role: ['Operation'], parent: 'Box 2', tooltip: '2021-08-27T11:04:00' },
        { id: 'Box 3', label: '', parent: 'Box 0' },
        { id: 'Edit 3', label: 'Edit', role: ['Operation'], parent: 'Box 3', tooltip: '2021-08-27T11:05:00' },
        { id: 'Execute 3', label: 'Execute', role: ['Operation'], parent: 'Box 3', tooltip: '2021-08-27T11:06:00' },
        { id: 'Models', label: 'Models', role: ['Data'], parent: 'Box 0' },
        { id: 'Model', label: 'Model', role: ['Data'], parent: 'Box 1', tooltip: 'SIR' },
        { id: 'Param:v0', label: 'Param:v0', role: ['Data'], parent: 'Box 1', tooltip: 'S: 997\nI: 3\nR:1' },
        { id: 'Param:v1', label: 'Param:v1', role: ['Data'], parent: 'Box 1', tooltip: 'S: 998\nI: 2\nR:1' },
        { id: 'Variables:v1', label: 'Variables:v1', role: ['Data'], parent: 'Box 1', tooltip: 'S_avg: 997\nI_avg: 1\nR_avg:1' },
        { id: 'Param:v2', label: 'Param:v2', role: ['Data'], parent: 'Box 2', tooltip: 'S: 996\nI: 4\nR:1' },
        { id: 'Variables:v2', label: 'Variables:v2', role: ['Data'], parent: 'Box 2', tooltip: 'S_avg: 997\nI_avg: 1\nR_avg:1' },
        { id: 'Param:v3', label: 'Param:v3', role: ['Data'], parent: 'Box 3', tooltip: 'S: 990\nI: 10\nR:1' },
        { id: 'Variables:v3', label: 'Variables:v3', role: ['Data'], parent: 'Box 3', tooltip: 'S_avg: 997\nI_avg: 1\nR_avg:1' },
      ],
      edges: [{ source: 'Models', target: 'Select' },
        { source: 'Select', target: 'Model' },
        { source: 'Select', target: 'Param:v0' },
        { source: 'Model', target: 'Execute 1' },
        { source: 'Param:v0', target: 'Edit 1' },
        { source: 'Edit 1', target: 'Param:v1' },
        { source: 'Param:v1', target: 'Execute 1' },
        { source: 'Execute 1', target: 'Variables:v1' },
        { source: 'Param:v1', target: 'Edit 2' },
        { source: 'Edit 2', target: 'Param:v2' },
        { source: 'Param:v2', target: 'Execute 2' },
        { source: 'Execute 2', target: 'Variables:v2' },
        { source: 'Model', target: 'Execute 2' },
        { source: 'Param:v2', target: 'Edit 3' },
        { source: 'Edit 3', target: 'Param:v3' },
        { source: 'Param:v3', target: 'Execute 3' },
        { source: 'Execute 3', target: 'Variables:v3' },
        { source: 'Model', target: 'Execute 3' },
      ],
    });

    static readonly MULTI_MODEL_CONDENSED: GraphInterface = ({
      nodes: [{ id: 'Box 0', label: '', parent: null },
        { id: 'Select', label: 'Select', role: ['Operation'], parent: 'Box 0', tooltip: '2021-08-27T11:00:00' },
        { id: 'Box 1', label: '', parent: 'Box 0' },
        { id: 'Edit 1a', label: 'Edit', role: ['Operation'], parent: 'Box 1', tooltip: '2021-08-27T11:01:00' },
        { id: 'Edit 1b', label: 'Edit', role: ['Operation'], parent: 'Box 1', tooltip: '2021-08-27T11:01:00' },
        { id: 'Execute 1', label: 'Execute', role: ['Operation'], parent: 'Box 1', tooltip: '2021-08-27T11:02:00' },
        { id: 'Box 2', label: '', parent: 'Box 0' },
        { id: 'Edit 2a', label: 'Edit', role: ['Operation'], parent: 'Box 2', tooltip: '2021-08-27T11:03:00' },
        { id: 'Edit 2b', label: 'Edit', role: ['Operation'], parent: 'Box 2', tooltip: '2021-08-27T11:03:00' },
        { id: 'Execute 2', label: 'Execute', role: ['Operation'], parent: 'Box 2', tooltip: '2021-08-27T11:04:00' },
        { id: 'Box 3', label: '', parent: 'Box 0' },
        { id: 'Edit 3a', label: 'Edit', role: ['Operation'], parent: 'Box 3', tooltip: '2021-08-27T11:05:00' },
        { id: 'Edit 3b', label: 'Edit', role: ['Operation'], parent: 'Box 3', tooltip: '2021-08-27T11:05:00' },
        { id: 'Execute 3', label: 'Execute', role: ['Operation'], parent: 'Box 3', tooltip: '2021-08-27T11:06:00' },
      ],
      edges: [{ source: 'Select', target: 'Execute 1' },
        { source: 'Select', target: 'Edit 1a' },
        { source: 'Edit 1a', target: 'Execute 1' },
        { source: 'Select', target: 'Edit 1b' },
        { source: 'Edit 1b', target: 'Execute 1' },
        { source: 'Select', target: 'Execute 2' },
        { source: 'Edit 1a', target: 'Edit 2a' },
        { source: 'Edit 1b', target: 'Edit 2b' },
        { source: 'Edit 2a', target: 'Execute 2' },
        { source: 'Edit 2b', target: 'Execute 2' },
        { source: 'Select', target: 'Execute 3' },
        { source: 'Edit 2a', target: 'Edit 3a' },
        { source: 'Edit 2b', target: 'Edit 3b' },
        { source: 'Edit 3a', target: 'Execute 3' },
        { source: 'Edit 3b', target: 'Execute 3' },
      ],
    });

    static readonly MULTI_MODEL_DETAILED: GraphInterface = ({
      nodes: [{ id: 'Box 0', label: '', parent: null },
        { id: 'Select', label: 'Select', role: ['Operation'], parent: 'Box 0', tooltip: '2021-08-27T11:00:00' },
        { id: 'Box 1', label: '', parent: 'Box 0' },
        { id: 'Edit 1a', label: 'Edit', role: ['Operation'], parent: 'Box 1', tooltip: '2021-08-27T11:01:00' },
        { id: 'Edit 1b', label: 'Edit', role: ['Operation'], parent: 'Box 1', tooltip: '2021-08-27T11:01:00' },
        { id: 'Execute 1', label: 'Execute', role: ['Operation'], parent: 'Box 1', tooltip: '2021-08-27T11:02:00' },
        { id: 'Box 2', label: '', parent: 'Box 0' },
        { id: 'Edit 2a', label: 'Edit', role: ['Operation'], parent: 'Box 2', tooltip: '2021-08-27T11:03:00' },
        { id: 'Edit 2b', label: 'Edit', role: ['Operation'], parent: 'Box 2', tooltip: '2021-08-27T11:03:00' },
        { id: 'Execute 2', label: 'Execute', role: ['Operation'], parent: 'Box 2', tooltip: '2021-08-27T11:04:00' },
        { id: 'Box 3', label: '', parent: 'Box 0' },
        { id: 'Edit 3a', label: 'Edit', role: ['Operation'], parent: 'Box 3', tooltip: '2021-08-27T11:05:00' },
        { id: 'Edit 3b', label: 'Edit', role: ['Operation'], parent: 'Box 3', tooltip: '2021-08-27T11:05:00' },
        { id: 'Execute 3', label: 'Execute', role: ['Operation'], parent: 'Box 3', tooltip: '2021-08-27T11:06:00' },
        { id: 'Models', label: 'Models', role: ['Data'], parent: 'Box 0' },
        { id: 'Model 1a', label: 'Model', role: ['Data'], parent: 'Box 1', tooltip: 'SIR' },
        { id: 'Model 1b', label: 'Model', role: ['Data'], parent: 'Box 1', tooltip: 'SEIR' },
        { id: 'Param a:v0', label: 'Param:v0', role: ['Data'], parent: 'Box 1', tooltip: 'S: 997\nI: 3\nR:1' },
        { id: 'Param b:v0', label: 'Param:v0', role: ['Data'], parent: 'Box 1', tooltip: 'S: 997\nI: 3\nR:1' },
        { id: 'Param a:v1', label: 'Param:v1', role: ['Data'], parent: 'Box 1', tooltip: 'S: 998\nI: 2\nR:1' },
        { id: 'Param b:v1', label: 'Param:v1', role: ['Data'], parent: 'Box 1', tooltip: 'S: 998\nI: 2\nR:1' },
        { id: 'Variables a:v1', label: 'Variables:v1', role: ['Data'], parent: 'Box 1', tooltip: 'S_avg: 997\nI_avg: 1\nR_avg:1' },
        { id: 'Variables b:v1', label: 'Variables:v1', role: ['Data'], parent: 'Box 1', tooltip: 'S_avg: 997\nI_avg: 1\nR_avg:1' },
        { id: 'Param a:v2', label: 'Param:v2', role: ['Data'], parent: 'Box 2', tooltip: 'S: 996\nI: 4\nR:1' },
        { id: 'Param b:v2', label: 'Param:v2', role: ['Data'], parent: 'Box 2', tooltip: 'S: 996\nI: 4\nR:1' },
        { id: 'Variables a:v2', label: 'Variables:v2', role: ['Data'], parent: 'Box 2', tooltip: 'S_avg: 997\nI_avg: 1\nR_avg:1' },
        { id: 'Variables b:v2', label: 'Variables:v2', role: ['Data'], parent: 'Box 2', tooltip: 'S_avg: 997\nI_avg: 1\nR_avg:1' },
        { id: 'Param a:v3', label: 'Param:v3', role: ['Data'], parent: 'Box 3', tooltip: 'S: 990\nI: 10\nR:1' },
        { id: 'Param b:v3', label: 'Param:v3', role: ['Data'], parent: 'Box 3', tooltip: 'S: 990\nI: 10\nR:1' },
        { id: 'Variables a:v3', label: 'Variables:v3', role: ['Data'], parent: 'Box 3', tooltip: 'S_avg: 997\nI_avg: 1\nR_avg:1' },
        { id: 'Variables b:v3', label: 'Variables:v3', role: ['Data'], parent: 'Box 3', tooltip: 'S_avg: 997\nI_avg: 1\nR_avg:1' },
      ],
      edges: [{ source: 'Models', target: 'Select' },
        { source: 'Select', target: 'Model 1a' },
        { source: 'Select', target: 'Model 1b' },
        { source: 'Select', target: 'Param a:v0' },
        { source: 'Select', target: 'Param b:v0' },
        { source: 'Model 1a', target: 'Execute 1' },
        { source: 'Model 1b', target: 'Execute 1' },
        { source: 'Param a:v0', target: 'Edit 1a' },
        { source: 'Param b:v0', target: 'Edit 1b' },
        { source: 'Edit 1a', target: 'Param a:v1' },
        { source: 'Edit 1b', target: 'Param b:v1' },
        { source: 'Param a:v1', target: 'Execute 1' },
        { source: 'Param b:v1', target: 'Execute 1' },
        { source: 'Execute 1', target: 'Variables a:v1' },
        { source: 'Execute 1', target: 'Variables b:v1' },
        { source: 'Param a:v1', target: 'Edit 2a' },
        { source: 'Param b:v1', target: 'Edit 2b' },
        { source: 'Edit 2a', target: 'Param a:v2' },
        { source: 'Edit 2b', target: 'Param b:v2' },
        { source: 'Param a:v2', target: 'Execute 2' },
        { source: 'Param b:v2', target: 'Execute 2' },
        { source: 'Execute 2', target: 'Variables a:v2' },
        { source: 'Execute 2', target: 'Variables b:v2' },
        { source: 'Model 1a', target: 'Execute 2' },
        { source: 'Model 1b', target: 'Execute 2' },
        { source: 'Param a:v2', target: 'Edit 3a' },
        { source: 'Param b:v2', target: 'Edit 3b' },
        { source: 'Edit 3a', target: 'Param a:v3' },
        { source: 'Edit 3b', target: 'Param b:v3' },
        { source: 'Param a:v3', target: 'Execute 3' },
        { source: 'Param b:v3', target: 'Execute 3' },
        { source: 'Execute 3', target: 'Variables a:v3' },
        { source: 'Execute 3', target: 'Variables b:v3' },
        { source: 'Model 1a', target: 'Execute 3' },
        { source: 'Model 1b', target: 'Execute 3' },
      ],
    });
}

export enum ProvenanceLayoutInterfaceType {
  condensed = 'condensed',
  detailed = 'detailed',
}

export interface ProvenanceLayoutInterface {
  name: string,
  id: ProvenanceLayoutInterfaceType,
}
