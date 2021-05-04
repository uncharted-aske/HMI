/**
 * Formats numbers using fixed-point notation
 */
export default (value:number, precision:number):string => {
    precision = precision || 2;
    return value.toFixed(precision);
}
  