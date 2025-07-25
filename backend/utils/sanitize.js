const sanitizeHtml = require('sanitize-html');
const validator = require('validator');

const sanitizeText = (text) => {
  if( typeof text !== "string") return text;

  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: [],
    disallowedTagsMode: 'discard'
  }).trim()
};

const sanitizeAmount = (amount) => {
  const num = parseFloat(amount);
  if(isNaN(num)) return 0;
  if(num < 0) return 0;
  if(num > 10000000) return 0;
  return Math.round(num*100) / 100;
};

const sanitizeTransactionType = (type) => {
  const validTypes = ['INCOME','EXPENSE']
  const upperType = String(type).toUpperCase();
  return validTypes.includes(upperType) ? upperType : 'EXPENSE'
}

const sanitizeDate = (dateString) => {
  const date = new Date(dateString)//trying to parse input to date object

  if(isNaN(date.getTime())){// When new Date() fails to parse a string, it creates an "Invalid Date" object, and calling getTime() on it returns NaN.
    return new Date()
  }

  const futureLimit = new Date()
  futureLimit.setFullYear(date.getFullYear() + 1)

  if(date > futureLimit){
    return new Date();
  }
  return date;
};

module.exports = {
  sanitizeText,
  sanitizeAmount,
  sanitizeDate,
  sanitizeTransactionType
}