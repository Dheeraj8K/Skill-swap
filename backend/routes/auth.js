const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

// Helper to decode Google JWT payload without requiring external network calls
function decodeGoogleToken(credential) {
  try {
    const parts = credential.split('.');
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = Buffer.from(payloadBase64, 'base64').toString('utf8');
      return JSON.parse(jsonPayload);
    }
  } catch (e) {
    console.warn("Could not decode Google credential JWT:", e.message);
  }
  return null;
}

// Google Sign-In & Sign-Up Endpoint
router.post('/google', async (req, res) => {
  try {
    const { credential, profile } = req.body;
    let googleUser = null;

    if (credential) {
      googleUser = decodeGoogleToken(credential);
    } else if (profile) {
      googleUser = profile;
    }

    if (!googleUser || !googleUser.email) {
      return res.status(400).json({ error: 'Valid Google account credentials required' });
    }

    const email = googleUser.email.toLowerCase();
    let user = store.getUserByEmail(email);

    if (!user) {
      // First-time Google user: Create new account
      const firstName = googleUser.given_name || googleUser.name?.split(' ')[0] || 'Google';
      const lastName = googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || 'User';
      const avatar = googleUser.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";

      user = store.createUser({
        firstName,
        lastName,
        email,
        avatar,
        headline: 'Skill Swap Member (via Google)',
        location: 'Remote',
        skillsOffering: [],
        skillsLearning: [],
        videoAvailable: true,
        googleAuth: true,
        googleId: googleUser.sub || 'google_' + Date.now(),
        agreeTerms: true
      });
    } else {
      // User exists: update avatar if from Google and missing
      if (googleUser.picture && !user.avatar) {
        user = store.updateUser(user.id, { avatar: googleUser.picture });
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const safeUser = { ...user };
    delete safeUser.passwordHash;

    res.json({
      message: `Welcome, ${safeUser.firstName}!`,
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ error: 'Server error during Google authentication' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, agreeTerms, skillsOffering, skillsLearning, headline, location } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const existing = store.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = store.createUser({
      firstName: firstName || 'Skill',
      lastName: lastName || 'Swapper',
      email: email.toLowerCase(),
      passwordHash,
      headline: headline || 'Knowledge Enthusiast',
      location: location || 'Remote',
      skillsOffering: skillsOffering || [],
      skillsLearning: skillsLearning || [],
      videoAvailable: true,
      agreeTerms: !!agreeTerms
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    const safeUser = { ...newUser };
    delete safeUser.passwordHash;

    res.status(201).json({
      message: 'Account created successfully',
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = store.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ error: 'Please sign in with Google for this account' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    res.json({
      message: 'Logged in successfully',
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Current User Profile
router.get('/me', authMiddleware, (req, res) => {
  const safeUser = { ...req.user };
  delete safeUser.passwordHash;
  res.json({ user: safeUser });
});

module.exports = router;
