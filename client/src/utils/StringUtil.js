const cleanTextFragment = (text) => {
    return text
      // New lines
      .replace(/\n/g, ' ')
      // Space before commas
      .replace(/\s,/g, ',')
      // Space before periods
      .replace(/\s,/g, '.')
      // Multiple spaces
      .replace(/\s\s+/g, ' ')
      // Avoid issues with opening/closing missing parenthesis
      .replace(/[()]+/g, '')
  }
  
  const truncateString = (text, n) => {
    let truncated = text
    if (text.length > n) {
      truncated = text.slice(0, n) + '...'
    }
    return truncated
  }
  
  export default {
    cleanTextFragment,
    truncateString
  }