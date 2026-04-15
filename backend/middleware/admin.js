import { safeUser } from '../utils/auth.js';

const adminMiddleware = (req, res, next) => {
  if (req.auth.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};

export default adminMiddleware;

