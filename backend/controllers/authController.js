
import bcrypt from 'bcryptjs';
import { findByEmail, createUser, findById } from '../models/User.js';
import { safeUser, generateToken } from '../utils/auth.js';
import { ObjectId } from 'mongodb';

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Invalid input' });
    
    const normalizedEmail = email.trim().toLowerCase();
    if (await findByEmail(normalizedEmail)) return res.status(409).json({ message: 'Email exists' });
    
    const newUser = await createUser(name, normalizedEmail, await bcrypt.hash(password, 10));
    console.log('New user registered:', newUser.email);
    
    return res.status(201).json({ user: safeUser(newUser), token: generateToken(newUser) });
  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email/password required' });
    
    const user = await findByEmail(email.trim().toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('User logged in:', user.email);
    return res.json({ user: safeUser(user), token: generateToken(user) });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get current user profile
export const getMe = async (req, res) => {
  try {
    const user = await findById(req.auth.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: safeUser(user) });
  } catch (error) {
    console.error('Profile error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Health check endpoint
export const healthCheck = (req, res) => res.json({ ok: true, service: 'careconnect', timestamp: new Date().toISOString() });

export default { register, login, getMe, healthCheck };

