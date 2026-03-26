import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/constants.js';

// Authentication middleware - verifies JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    req.auth = payload;

    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;

