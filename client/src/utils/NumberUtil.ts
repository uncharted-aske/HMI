/**
 * Shorten a number using English scientific notation.
 * (i.e. 100,000 -> 100K)
 */
export const shorterNb = (value: number): string => {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(value);
};

/**
 * Round a number to the nearest power of 10.
 * (i.e. 0.456 -> 1, -45.6 -> -100)
 */
export const RoundToPow10 = (value: number): number => {
  if (value < 0) {
    return Math.pow(10, Math.ceil(Math.log10(-value))) * -1;
  } else {
    return Math.pow(10, Math.ceil(Math.log10(value)));
  }
};
