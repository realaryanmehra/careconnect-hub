import bcrypt from 'bcryptjs';
import { findByEmail, createUser, findById } from '../models/User.js';
import { safeUser, generateToken } from '../utils/auth.js';
import { ObjectId } from 'mongodb';

// POST /register - Create new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await createUser(name, normalizedEmail, passwordHash);
    console.log(`✅ New user registered: ${newUser.email}`);

    return res.status(201).json({
      message: 'Registration successful',
      user: safeUser(newUser),
      token: generateToken(newUser),
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// POST /login - Authenticate user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await findByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`✅ User logged in: ${user.email}`);

    return res.json({
      message: 'Login successful',
      user: safeUser(user),
      token: generateToken(user),
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// GET /me - Get current user profile
export const getMe = async (req, res) => {
  try {
    const userId = req.auth.id;

    const user = await findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user: safeUser(user) });
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// GET /health
export const healthCheck = (req, res) => {
  res.json({ 
    ok: true, 
    service: 'careconnect-auth', 
    database: 'MongoDB',
    timestamp: new Date().toISOString() 
  });
};

export default { register, login, getMe, healthCheck };

