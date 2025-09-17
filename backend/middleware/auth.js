const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/constants');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = { id: payload.userId, email: payload.email, role: payload.role };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { authRequired };
