export abstract class Colors {
  static readonly NODES: Record<string, any> = {
    DEFAULT: '#EEEEEE',
    ROOT_CONTAINER: '#4C566A',
    CONTAINER: '#434C5E',
    MODEL_VARIABLE: '#3498db',
    INITIAL_CONDITION: '#A6CEE3',
  };

  static readonly LABELS: Record<string, any> = {
    DARK: '#2E3440',
    LIGHT: '#ECEFF4',
  };

  static readonly EDGES: string = '#81A1C1';
  static readonly SUBGRAPH: string = '#FFA500';
  static readonly HIGHLIGHT: string = '#E67E22';
  static readonly STROKE: string = '#81A1C1';
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
