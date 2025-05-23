const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ status: 'failed', message: 'Authorization header missing' });
  }

  // Expecting header format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ status: 'failed', message: 'Invalid authorization header format' });
  }

  const token = parts[1];

  if (!token) {
    return res.status(401).json({ status: 'failed', message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded payload to request object
    next();
  } catch (err) {
    return res.status(401).json({ status: 'failed', message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
