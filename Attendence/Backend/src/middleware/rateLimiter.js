
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 2000, 
  message: 'Too many requests, please try again after a minute',
});
module.exports = limiter;
