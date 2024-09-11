const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const authenticateGoogleJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    const JWT_SECRET = process.env.JWT_SECRET;
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token. Access forbidden.' });
      }

      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({ message: 'Authorization token missing. Unauthorized.' });
  }
};

module.exports = authenticateGoogleJWT;
