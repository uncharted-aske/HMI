// Lex Search Model Type suggestion options
export const MODEL_TYPE_OPTIONS = ['computational', 'knowledge'] as const;
export type ModelType = typeof MODEL_TYPE_OPTIONS[number];

// Lex Search Model Type suggestion options
export const COSMOS_TYPE_OPTIONS = ['Table', 'Figure', 'Equation', 'Body Text', 'Combined'] as const;
export type CosmosType = typeof COSMOS_TYPE_OPTIONS[number];

export const BOOLEAN_OPTIONS = ['False', 'True'] as const;
export type BooleanOptionsType = typeof COSMOS_TYPE_OPTIONS[number];

export const BIO_EDGE_TYPE_OPTIONS = [
  'Acetylation',
  'Activation',
  'Conversion',
  'DecreaseAmount',
  'Deglycosylation',
  'Dehydroxylation',
  'Demethylation',
  'Dephosphorylation',
  'IncreaseAmount',
  'Inhibition',
  'Phosphorylation',
  'Ribosylation',
  'Sumoylation',
  'Ubiquitination',
] as const;
export type BioEdgeTypeOptions = typeof COSMOS_TYPE_OPTIONS[number];
