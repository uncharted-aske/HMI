import { WiscSearchObjectsInterface } from '@/types/typesWisc';

export const getAuthorList = (item: WiscSearchObjectsInterface): string => {
  return item.bibjson === undefined || item.bibjson.author.length === 0
    ? 'Unknown Author'
    : item.bibjson.author.reduce((acc, author, index) => {
      acc += author.name;
      if (index !== item.bibjson.author.length - 1) {
        acc += ', ';
      }
      return acc;
    }, '');
};
