/**
 * Display a number using scientific notation.
 */
export const scientificNotation = (value: number, asHTML: boolean = false): string => {
  const scientificNotation = new Intl.NumberFormat('en', { notation: 'scientific' }).format(value);
  const [decimal, power] = scientificNotation.split('E');
  if (Number(power) === 0) {
    return decimal;
  } else if (asHTML) {
    return `${decimal} &times; 10<sup>${power}</sup>`;
  } else {
    return `${decimal} x 10^${power}`;
  }
};

/**
 * Shorten a number using English short form.
 * (i.e. 100000 -> 100K)
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
