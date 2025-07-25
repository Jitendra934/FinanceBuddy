const { sanitizeText } = require("../utils/sanitize")

const sanitizeMiddleware = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if(typeof obj === 'string'){
      return sanitizeText(obj)
    };

    if(Array.isArray(obj)) {
      obj.map(sanitizeObject)
    };

    if(typeof obj === 'object' && obj !== null){
      const sanitized = {};
      for(const [key,value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value)
      }
      return sanitized
    };

    return obj;
  };

  if(req.body) {
    req.body = sanitizeObject(req.body)
  }

  if(req.query) {
    req.query = sanitizeObject(req.query)
  }

  next();
};

module.exports = sanitizeMiddleware