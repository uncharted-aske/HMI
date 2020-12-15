export default (value:string):string => {
  return value.replace(/[{}]/g, '');
};
