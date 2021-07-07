export default (value:string):string => {
  return value.charAt(0).toLocaleUpperCase()
    .concat(value.slice(1).toLocaleLowerCase());
};
