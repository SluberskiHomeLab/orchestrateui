const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      authMethod: user.authMethod 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Hash password
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Compare password
async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate API key
function generateApiKey() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateApiKey,
  JWT_SECRET
};
