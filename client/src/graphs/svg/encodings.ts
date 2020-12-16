export abstract class Colors {
  static readonly NODES: Record<string, any> = {
    DEFAULT: '#EEEEEE',
    CONTAINER: '#F8F8F8',
    MODEL_VARIABLE: '#1F78B4',
    INITIAL_CONDITION: '#A6CEE3',
  };

  static readonly LABELS: Record<string, any> = {
    DARK: '#333333',
    LIGHT: '#FFFFFF',
  };

  static readonly EDGES: string = '#6C757D';
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
