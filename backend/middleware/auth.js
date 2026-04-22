// SIMPLE JWT AUTH MIDDLEWARE - Check cookie token
import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  try {
    // Step 1: Get token from cookie
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Step 2: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    
    // Step 3: Add user to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;

