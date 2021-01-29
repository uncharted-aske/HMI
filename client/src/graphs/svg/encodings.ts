export abstract class Colors {
  static readonly NODES: Record<string, any> = {
    DEFAULT: '#EEEEEE',
    ROOT_CONTAINER: '#2E3440',
    CONTAINER: '#3B4252',
    MODEL_VARIABLE: '#1F78B4',
    INITIAL_CONDITION: '#A6CEE3',
  };

  static readonly LABELS: Record<string, any> = {
    DARK: '#2E3440',
    LIGHT: '#ECEFF4',
  };

  static readonly EDGES: string = '#ECEFF4';
  static readonly SUBGRAPH: string = '#FFA500';
  static readonly HIGHLIGHT: string = '#F03B20';
}

export abstract class NodeTypes {
  static readonly NODES: Record<string, any> = {
    VARIABLE: 'variable',
    FUNCTION: 'function',
    CONTAINER: 'container',
  }

  static readonly VARIABLES: Record<string, any> = {
    INPUT: 'input',
    OUTPUT: 'output',
    PARAMETER: 'parameter',
    MODEL_VARIABLE: 'model_variable',
    INITIAL_CONDITION: 'initial_condition',
    INTERNAL_VARIABLE: 'internal_variable',
  }
}
