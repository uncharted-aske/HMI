export abstract class Colors {
  static readonly SUBGRAPH: string = '#FFA500';
  static readonly HIGHLIGHT: string = '#D08770';
  static readonly STROKE: string = '#81A1C1';

  static readonly NODES: Record<string, any> = {
    DEFAULT: '#ECEFF4',
    ROOT_CONTAINER: '#4C566A',
    CONTAINER: '#2E3440',
    MODEL_VARIABLE: '#88C0D0',
    INITIAL_CONDITION: '#81A1C1',
    OVERLAPPING: Colors.HIGHLIGHT,
  };

  // Bio graphs
  static readonly POLARITY: Record<string, any> = {
    POSITIVE: '#81A1C1',
    NEGATIVE: '#BF616A',
  };

  static readonly CURATION: Record<string, any> = {
    INCORRECT: '#BF616A',
    CORRECT: '#7ca25c',
    PARTIAL: '#D08770',
    UNCURATED: '#212529'
  };

  static readonly EDGES: Record<string, any> = {
    DEFAULT: '#c2c7d1',
    OVERLAPPING: Colors.HIGHLIGHT,
  };

  static readonly LABELS: Record<string, any> = {
    DARK: '#2E3440',
    LIGHT: '#ECEFF4',
    BACKGROUND: '#D08770',
    STROKE: '#BF616A',
  };
}

export abstract class NodeTypes {
  static readonly NODES: Record<string, any> = {
    VARIABLE: 'variable',
    FUNCTION: 'function',
    CONTAINER: 'container',
    OVERLAPPING: 'overlapping',
    ABSTRACTOVERLAPPING: 'AP',
    NONOVERLAPPING: 'NOAP',
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

export abstract class EdgeTypes {
  static readonly EDGES: Record<string, any> = {
    // Statement types
    INHIBITION: 'Inhibition',
    ACTIVATION: 'Activation',
    INCREASEAMOUNT: 'IncreaseAmount',
    DECREASEAMOUNT: 'DecreaseAmount',
    PHOSPORYLATION: 'Phosporylation',
    DEPHOSPORYLATION: 'Dephosporylation',
    COMPLEX: 'Complex',

    OVERLAPPING: 'overlapping',
    ABSTRACTOVERLAPPING: 'AP',
    NONOVERLAPPING: 'NOAP',
  }

  static readonly CURATION_STATUS: Record<string, any> = {
    INCORRECT: 0,
    CORRECT: 1,
    PARTIAL: 2,
    UNCURATED: 3,
  }

}
