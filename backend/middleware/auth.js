// SIMPLE JWT AUTH MIDDLEWARE - Check Authorization header or cookie token
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/constants.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Step 1: Get token from Authorization header (Bearer token) or cookie
    let token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Step 2: Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Step 3: Validate payload
    if (!decoded.id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // Step 4: Add user to request
    req.auth = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;

