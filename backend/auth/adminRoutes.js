const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { users, apiKeys, User, ApiKey } = require('./models');
const { hashPassword, generateApiKey } = require('./utils');
const { authenticate, requireAdmin } = require('./middleware');

// Apply authentication and admin check to all admin routes
router.use(authenticate);
router.use(requireAdmin);

// ===== USER MANAGEMENT =====

// Get all users
router.get('/users', (req, res) => {
  const safeUsers = users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    authMethod: u.authMethod,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
  }));
  
  res.json(safeUsers);
});

// Get user by ID
router.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    authMethod: user.authMethod,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    const { username, password, email, role, authMethod } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    // Check if user exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // For local auth, password is required
    if (authMethod === 'local' && !password) {
      return res.status(400).json({ error: 'Password is required for local auth' });
    }
    
    // Hash password if local auth
    const hashedPassword = authMethod === 'local' ? await hashPassword(password) : null;
    
    const user = new User({
      id: uuidv4(),
      username,
      password: hashedPassword,
      email: email || null,
      role: role || 'user',
      authMethod: authMethod || 'local'
    });
    
    users.push(user);
    
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      authMethod: user.authMethod,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'User creation failed' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const user = users.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { username, password, email, role } = req.body;
    
    // Check if username is taken by another user
    if (username && username !== user.username) {
      const existingUser = users.find(u => u.username === username && u.id !== user.id);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }
    
    // Update fields
    if (username) user.username = username;
    if (email !== undefined) user.email = email;
    if (role) user.role = role;
    
    // Update password if provided (only for local auth)
    if (password && user.authMethod === 'local') {
      user.password = await hashPassword(password);
    }
    
    user.updatedAt = new Date().toISOString();
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      authMethod: user.authMethod,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'User update failed' });
  }
});

// Delete user
router.delete('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Prevent deleting yourself
  if (users[index].id === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  
  // Delete associated API keys
  const userApiKeys = apiKeys.filter(k => k.userId === users[index].id);
  userApiKeys.forEach(key => {
    const keyIndex = apiKeys.indexOf(key);
    if (keyIndex > -1) apiKeys.splice(keyIndex, 1);
  });
  
  users.splice(index, 1);
  
  res.json({ message: 'User deleted successfully' });
});

// ===== API KEY MANAGEMENT =====

// Get all API keys (for all users)
router.get('/apikeys', (req, res) => {
  const safeKeys = apiKeys.map(k => ({
    id: k.id,
    userId: k.userId,
    name: k.name,
    key: k.key.substring(0, 8) + '...' + k.key.substring(k.key.length - 4), // Partially masked
    createdAt: k.createdAt,
    expiresAt: k.expiresAt,
    lastUsed: k.lastUsed
  }));
  
  res.json(safeKeys);
});

// Get API keys for specific user
router.get('/users/:userId/apikeys', (req, res) => {
  const userKeys = apiKeys.filter(k => k.userId === req.params.userId);
  
  const safeKeys = userKeys.map(k => ({
    id: k.id,
    userId: k.userId,
    name: k.name,
    key: k.key.substring(0, 8) + '...' + k.key.substring(k.key.length - 4),
    createdAt: k.createdAt,
    expiresAt: k.expiresAt,
    lastUsed: k.lastUsed
  }));
  
  res.json(safeKeys);
});

// Create API key for user
router.post('/users/:userId/apikeys', (req, res) => {
  const user = users.find(u => u.id === req.params.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { name, expiresAt } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'API key name is required' });
  }
  
  const key = generateApiKey();
  
  const apiKey = new ApiKey({
    id: uuidv4(),
    userId: user.id,
    key: key,
    name: name,
    expiresAt: expiresAt || null
  });
  
  apiKeys.push(apiKey);
  
  res.status(201).json({
    id: apiKey.id,
    userId: apiKey.userId,
    name: apiKey.name,
    key: key, // Return full key only on creation
    createdAt: apiKey.createdAt,
    expiresAt: apiKey.expiresAt
  });
});

// Delete API key
router.delete('/apikeys/:id', (req, res) => {
  const index = apiKeys.findIndex(k => k.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'API key not found' });
  }
  
  apiKeys.splice(index, 1);
  
  res.json({ message: 'API key deleted successfully' });
});

module.exports = router;
