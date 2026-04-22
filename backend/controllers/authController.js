
import bcrypt from 'bcryptjs';
import { safeUser, generateToken } from '../utils/auth.js';

// Use global flags from server.js (no import needed)


// REGISTER - Mongoose makes it 10 lines!
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: 'Name, email, password (6+ chars)' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await globalThis.User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'patient'
    });

    res.status(201).json({
      user: safeUser(user),
      token: generateToken(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};



// LOGIN - Simple Mongoose
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await globalThis.User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Admin test user
    if (user.email === 'drsamar@gmail.com') user.role = 'admin';

    res.json({
      user: safeUser(user),
      token: generateToken(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// GET CURRENT USER PROFILE (protected route)
export const getMe = async (req, res) => {
  // FALLBACK demo user
  if (!dbReady) {
    const demoUser = FALLBACK_DATA.users[0];
    return res.json({ user: { id: demoUser._id, name: demoUser.name, email: demoUser.email, role: 'patient' } });
  }

  try {
    // Step 1: Check DB ready
    ensureDB();
    
    // Step 2: Find user by ID from token
    const user = await globalThis.usersCollection.findOne({ 
      _id: new ObjectId(req.auth.id) 
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Step 3: Return safe user info (no password)
    return res.json({ user: safeUser(user) });
  } catch (error) {
    console.error('Get me error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Health check - Simple server status
export const healthCheck = (req, res) => {
  res.json({ 
    ok: true, 
    service: 'careconnect-backend', 
    timestamp: new Date().toISOString(),
    dbReady 
  });
};

export default { register, login, getMe, healthCheck };


