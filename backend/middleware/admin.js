// ADMIN ONLY MIDDLEWARE - Check if user is admin
const adminMiddleware = (req, res, next) => {
  // Step 1: Ensure auth middleware populated the request
  if (!req.auth?.role) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Step 2: Check user role
  if (req.auth.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

export default adminMiddleware;

