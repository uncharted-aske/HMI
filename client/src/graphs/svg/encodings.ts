export abstract class Colors {
  static readonly HIGHLIGHT: string = '#EBCB8B';
  static readonly STROKE: string = '#81A1C1';

  static readonly NODES: Record<string, any> = {
    DEFAULT: '#ECEFF4',
    EDITED: '#D08770',

    // Gromet
    CONTAINER: '#2E3440',
    VARIABLE: '#E75BCD',
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
    UNCURATED: '#212529',
  };
  // Bio graphs

  static readonly EDGES: Record<string, any> = {
    DEFAULT: '#c2c7d1',
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
    // GroMEt roles
    VARIABLE: 'variable',
    PARAMETER: 'parameter',
    INITIAL_CONDITION: 'initial_condition',
    // GroMEt roles
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
  }

  static readonly CURATION_STATUS: Record<string, any> = {
    INCORRECT: 0,
    CORRECT: 1,
    PARTIAL: 2,
    UNCURATED: 3,
  }
}
