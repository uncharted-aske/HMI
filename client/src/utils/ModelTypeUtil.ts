// Lex Search Model Type suggestion options
export const MODEL_TYPE_OPTIONS = ['computational', 'knowledge'] as const;
export type ModelType = typeof MODEL_TYPE_OPTIONS[number];
