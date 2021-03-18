export const truncateString = (text:string, n:number): string => {
  let truncated = text;
  if (text.length > n) {
    truncated = text.slice(0, n) + '...';
  }
  return truncated;
};
