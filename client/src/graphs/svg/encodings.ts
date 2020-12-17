export abstract class Colors {
  static readonly NODES: Record<string, any> = {
    DEFAULT: '#EEEEEE',
    CONTAINER: '#F8F8F8',
    MODEL_VARIABLE: '#9acbff',
    INPUT: '#b3b3b3',
    OUTPUT: '#808080',
  };

  static readonly EDGES: string = '#6C757D';
  static readonly HIGHLIGHT: string = '#FFA500';
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
