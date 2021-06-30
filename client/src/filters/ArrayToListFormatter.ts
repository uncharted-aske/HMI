/**
 * Return an Array of string or number as a comma separated list.
 */
export default (value: Array<string | number>): string => {
  return value.map(v => v.toString()).join(', ');
};
