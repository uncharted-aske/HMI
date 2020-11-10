
const MODEL_TYPE = Object.freeze({
  COMPUTATIONAL: 0,
  KNOWLEDGE: 1,
});

const MODEL_TYPE_INDEX = Object.freeze({
  [MODEL_TYPE.COMPUTATIONAL]: 0,
  [MODEL_TYPE.KNOWLEDGE]: 1,
});

const MODEL_TYPE_OPTIONS = Object.freeze({
  [MODEL_TYPE.COMPUTATIONAL]: 'computational',
  [MODEL_TYPE.KNOWLEDGE]: 'knowledge',
});

export {
  MODEL_TYPE_INDEX,
  MODEL_TYPE_OPTIONS,
};
