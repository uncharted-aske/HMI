export abstract class Colors {
  static readonly NODES: Record<string, any> = {
    DEFAULT: '#EEEEEE',
    CONTAINER: '#F8F8F8',
    MODEL_VARIABLE: '#0091EA',
    PARAMETER: '#FFC04D',
  };

  static readonly EDGES: string = '#6C757D';
}

export abstract class NodeTypes {
  static readonly NODES: Record<string, any> = {
    VARIABLE: 'variable',
    FUNCTION: 'function',
    LOOP_CONTAINER: 'LoopContainer',
    FUNC_CONTAINER: 'FuncContainer',
    COND_CONTAINER: 'CondContainer',
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
