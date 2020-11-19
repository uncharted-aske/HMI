/**
 * Nodes and edges color mappings
 */
export abstract class Colors {
  static readonly NODES: Record<string, any> = {
    DEFAULT: '#EEEEEE',
    CONTAINER:'#F8F8F8',
    MODEL_VARIABLE: '#0091EA',
    PARAMETER: '#FFC04D',
  };

  static readonly EDGES: string = '#6C757D';
}
