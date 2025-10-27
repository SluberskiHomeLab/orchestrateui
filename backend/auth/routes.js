const express = require('express');
const router = express.Router();
const passport = require('./passport');
const { v4: uuidv4 } = require('uuid');
const { users } = require('./models');
const { User } = require('./models');
const { generateToken, hashPassword } = require('./utils');
const { authenticate, authEnabled } = require('./middleware');

// Health check for auth
router.get('/health', (req, res) => {
  res.json({ 
    authEnabled,
    oidcEnabled: process.env.OIDC_ENABLED === 'true',
    ldapEnabled: process.env.LDAP_ENABLED === 'true'
  });
});

// Register new user (local auth)
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if user exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = new User({
      id: uuidv4(),
      username,
      password: hashedPassword,
      email: email || null,
      role: users.length === 0 ? 'admin' : 'user', // First user is admin
      authMethod: 'local'
    });
    
    users.push(user);
    
    // Generate token
    const token = generateToken(user);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login with username/password
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ error: info?.message || 'Authentication failed' });
    }
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        authMethod: user.authMethod
      }
    });
  })(req, res, next);
});

// OIDC login
if (process.env.OIDC_ENABLED === 'true') {
  router.get('/oidc', passport.authenticate('oidc'));
  
  router.get('/oidc/callback', 
    passport.authenticate('oidc', { session: false, failureRedirect: '/login' }),
    (req, res) => {
      // Generate token
      const token = generateToken(req.user);
      
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
    }
  );
}

// LDAP login
if (process.env.LDAP_ENABLED === 'true') {
  router.post('/ldap', (req, res, next) => {
    passport.authenticate('ldap', { session: false }, (err, user, info) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!user) {
        return res.status(401).json({ error: info?.message || 'LDAP authentication failed' });
      }
      
      // Generate token
      const token = generateToken(user);
      
      res.json({
        message: 'LDAP login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          authMethod: user.authMethod
        }
      });
    })(req, res, next);
  });
}

// Get current user info
router.get('/me', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    authMethod: user.authMethod,
    createdAt: user.createdAt
  });
});

// Logout (client-side token removal, but endpoint for consistency)
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
