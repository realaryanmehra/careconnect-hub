// ADMIN ONLY MIDDLEWARE - Check if user is admin
const adminMiddleware = (req, res, next) => {
  // Step 1: Check user role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

export default adminMiddleware;

