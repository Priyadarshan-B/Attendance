const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const authenticateGoogleJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const JWT_SECRET = process.env.JWT_SECRET;
    const CLIENT_URL = process.env.CLIENT_URL;

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.redirect(302, `${CLIENT_URL}/login`);
      }

      req.user = user;
      next();
    });
  } else {
    return res.redirect(302, `${CLIENT_URL}/login`);
  }
};

module.exports = authenticateGoogleJWT;
