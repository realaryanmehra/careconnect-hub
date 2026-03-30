// Utility functions for authentication

import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './constants.js';

// Create safe user object (without sensitive data)
export const safeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export default { safeUser, generateToken };
