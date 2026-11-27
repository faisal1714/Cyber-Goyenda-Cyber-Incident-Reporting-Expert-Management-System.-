const { verifyToken } = require('../utils/jwt');

function authUser(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized access' });
  }

  try {
    const decoded = verifyToken(token);
    if (decoded.type !== 'user') {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }
    req.user = decoded; // { id, email, username, type }
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
}

module.exports = authUser;
