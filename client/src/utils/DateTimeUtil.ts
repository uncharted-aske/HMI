/**
 * Transforms a Date into a string to be displayed in the following format:
 * Month DD, YYYY HH:MM (GMT±zz)
 * @param date {string | Date}
 * @returns {Date}
 */
export const formatFullDateTime = (datetime: string | Date): string => {
  if (!datetime) {
    // eslint-disable-next-line no-console
    console.warn('niceDate', 'No date provided.');
    return 'Not available';
  }

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: 'long',
    timeZoneName: 'short',
    year: 'numeric',
  };

  const jsDate = new Date(datetime);
  if (!isNaN(jsDate.getTime())) { // Check it's not an `Invalid Date`
    return jsDate.toLocaleString('en', options);
  }

  // Let's try ISO 8601 Extended Format => YYYY-MM-DDTHH:mm:ss:ffffff_ZZZ±zzzz
  const regISOExtended = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}):\d{2,6}_(\w{3})([\\+-]\d{4})/gi;
  const isoExtended = regISOExtended.exec(datetime.toString());
  if (isoExtended) {
    // to ISO 8601 long format => YYYY-MM-DDTHH:mm:ss±zzzz
    const isoLong = new Date(isoExtended[1] + isoExtended[3]);
    if (!isNaN(isoLong.getTime())) { // Check it's not an `Invalid Date`
      options.timeZone = isoExtended[2];
      return isoLong.toLocaleString('en', options);
    }
  }

  // eslint-disable-next-line no-console
  console.warn('niceDate', 'the format provided is not a recognised format.');
  return 'Not available';
};
