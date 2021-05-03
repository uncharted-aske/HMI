/**
 * Shorten a number using English scientific notation. (i.e. 100,000 -> 100K)
 * @param {number} value
 * @return {string}
 */
export function shorterNb (value: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(value);
}
