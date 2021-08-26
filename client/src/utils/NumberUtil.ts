const fixFloatingPoint = (val:number):number =>
  Number.parseFloat(val.toPrecision(15));

/**
 * Display a number using scientific notation.
 */
export const scientificNotation = (value: number, asHTML: boolean = false): string => {
  const scientificNotation = new Intl.NumberFormat('en', { notation: 'scientific' }).format(value);
  const [decimal, power] = scientificNotation.split('E');
  const roundDecimal = Math.round(Number(decimal));

  // Show the full decimal for the powers of -4, -3, -2, -1, 0, 1, 2, 3, and 4.
  if ([-4, -3, -2, -1, 0, 1, 2, 3, 4].includes(Number(power))) {
    return value.toString();
  } else if (asHTML) {
    return `${roundDecimal}&times;10<sup>${power}</sup>`;
  } else {
    return `${roundDecimal}x10^${power}`;
  }
};

/**
 * Display a number using scientific notation with the number and exponent split.
 * @returns {[string, string]} First element of array is HTML containing the coefficient.
 * Second element of the array is the superscript which includes the exponent.
 */
export const scientificNotationSplitStr = (value: number): [string, string] => {
  const scientificNotation = new Intl.NumberFormat('en', { notation: 'scientific' }).format(value);
  const [decimal, power] = scientificNotation.split('E');
  const roundDecimal = Math.round(Number(decimal));

  // Show the full decimal for the powers of -4, -3, -2, -1, 0, 1, 2, 3, and 4.
  if ([-4, -3, -2, -1, 0, 1, 2, 3, 4].includes(Number(power))) {
    return [value.toString(), ''];
  } else {
    return [`${roundDecimal}&times;10`, power.toString()];
  }
};

/**
 * Format number using plain number formatting
 * (i.e. 1000.123456 -> 1,000.123)
 */
export const standardNb = (value: number): string => {
  return new Intl.NumberFormat('en', { notation: 'standard' }).format(value);
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
    return fixFloatingPoint(Math.pow(10, Math.ceil(Math.log10(-value))) * -1);
  } else {
    return fixFloatingPoint(Math.pow(10, Math.ceil(Math.log10(value))));
  }
};
