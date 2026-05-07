import bcrypt from 'bcryptjs';
import { safeUser, generateToken } from '../utils/auth.js';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!globalThis.dbReady) {
      const userIndex = globalThis.FALLBACK_DATA.users.findIndex((item) => item.email === normalizedEmail);
      if (userIndex === -1) {
        // Return 200 even if user doesn't exist for security reasons
        return res.status(200).json({ message: 'If an account exists, a password reset link has been sent.' });
      }

      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetPasswordExpires = Date.now() + 3600000; // 1 hour

      globalThis.FALLBACK_DATA.users[userIndex].resetPasswordToken = resetToken;
      globalThis.FALLBACK_DATA.users[userIndex].resetPasswordExpires = resetPasswordExpires;

      const frontendUrl = req.headers.origin || 'http://localhost:5173';
      const resetLink = `${frontendUrl}/reset-password/${resetToken}`;
      
      console.log(`[DEV MODE] Password reset link for ${normalizedEmail}: ${resetLink}`);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: 'CareConnect Hub - Password Reset',
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <a href="${resetLink}" style="padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Reset Password</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
        `
      };

      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        
        // Fire and forget to prevent hanging the request
        transporter.sendMail(mailOptions)
          .then(() => console.log(`Reset email sent to ${normalizedEmail}`))
          .catch(err => console.error('Error sending email:', err));
          
      } catch (err) {
        console.error('Error setting up email transporter:', err);
      }
      
      return res.status(200).json({ message: 'If an account exists, a password reset link has been sent.' });
    }

    const user = await globalThis.User.findOne({ email: normalizedEmail });
    
    if (!user) {
      // Return 200 even if user doesn't exist for security reasons
      return res.status(200).json({ message: 'If an account exists, a password reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();

    const frontendUrl = req.headers.origin || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;
    console.log(`Password reset link for ${normalizedEmail}: ${resetLink}`);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: 'CareConnect Hub - Password Reset',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetLink}" style="padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
      `
    };

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      // Fire and forget to prevent hanging the request
      transporter.sendMail(mailOptions)
        .then(() => console.log(`Reset email sent to ${normalizedEmail}`))
        .catch(err => console.error('Error sending email:', err));
        
    } catch (err) {
      console.error('Error setting up email transporter:', err);
    }

    res.status(200).json({ message: 'If an account exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!globalThis.dbReady) {
      const userIndex = globalThis.FALLBACK_DATA.users.findIndex(
        (item) => item.resetPasswordToken === token && item.resetPasswordExpires > Date.now()
      );

      if (userIndex === -1) {
        return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      globalThis.FALLBACK_DATA.users[userIndex].passwordHash = passwordHash;
      globalThis.FALLBACK_DATA.users[userIndex].resetPasswordToken = undefined;
      globalThis.FALLBACK_DATA.users[userIndex].resetPasswordExpires = undefined;

      return res.status(200).json({ message: 'Password has been updated.' });
    }

    const user = await globalThis.User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been updated.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { register, login, getMe, healthCheck, googleAuth, forgotPassword, resetPassword };


