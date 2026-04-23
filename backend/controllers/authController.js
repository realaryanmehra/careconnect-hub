import bcrypt from 'bcryptjs';
import { safeUser, generateToken } from '../utils/auth.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Use global flags from server.js (no import needed)


// REGISTER - Mongoose makes it 10 lines!
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: 'Name, email, password (6+ chars)' });
    }

    if (!globalThis.dbReady) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = globalThis.FALLBACK_DATA.users.find((user) => user.email === normalizedEmail);
      if (existingUser) {
        return res.status(409).json({ message: 'Email exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = {
        _id: `demo-user-${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'patient',
        createdAt: new Date()
      };
      globalThis.FALLBACK_DATA.users.push(user);

      return res.status(201).json({
        user: safeUser(user),
        token: generateToken(user)
      });
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

    if (!globalThis.dbReady) {
      const normalizedEmail = email.toLowerCase().trim();
      const user = globalThis.FALLBACK_DATA.users.find((item) => item.email === normalizedEmail);

      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      return res.json({
        user: safeUser(user),
        token: generateToken(user)
      });
    }

    const user = await globalThis.User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Admin test user
    if (user.email === 'samar@gmail.com') user.role = 'admin';

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
  try {
    if (!globalThis.dbReady) {
      const user = globalThis.FALLBACK_DATA.users.find((item) => item._id.toString() === req.auth.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({ user: safeUser(user) });
    }

    const user = await globalThis.User.findById(req.auth.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
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
    dbReady: !!globalThis.dbReady
  });
};

// GOOGLE AUTH
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Google token required' });
    }

    let payload;
    
    // Check if token is a standard JWT id_token or an access_token
    if (token.split('.').length === 3) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      // It's an access_token from useGoogleLogin
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      payload = await response.json();
      if (!response.ok) {
        throw new Error('Invalid Google access token');
      }
    }

    const { email, name, sub: googleId } = payload;
    
    const normalizedEmail = email.toLowerCase().trim();

    if (!globalThis.dbReady) {
      let user = globalThis.FALLBACK_DATA.users.find((item) => item.email === normalizedEmail);

      if (!user) {
        user = {
          _id: `google-user-${Date.now()}`,
          name: name.trim(),
          email: normalizedEmail,
          passwordHash: await bcrypt.hash(googleId, 10), // random hash
          role: 'patient',
          createdAt: new Date()
        };
        globalThis.FALLBACK_DATA.users.push(user);
      }

      return res.json({
        user: safeUser(user),
        token: generateToken(user)
      });
    }

    let user = await globalThis.User.findOne({ email: normalizedEmail });
    
    if (!user) {
      const passwordHash = await bcrypt.hash(googleId, 10);
      user = await globalThis.User.create({
        name,
        email: normalizedEmail,
        passwordHash,
        role: 'patient'
      });
    }

    // Admin test user
    if (user.email === 'samar@gmail.com') user.role = 'admin';

    res.json({
      user: safeUser(user),
      token: generateToken(user)
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

export default { register, login, getMe, healthCheck, googleAuth };


