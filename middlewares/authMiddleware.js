const { verify } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token not provided' });

  try {
    const user = verify(token);
    req.user = user;
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
