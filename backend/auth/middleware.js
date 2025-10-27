const { verifyToken } = require('./utils');
const { users, apiKeys } = require('./models');

// Check if authentication is enabled
const authEnabled = process.env.AUTH_ENABLED === 'true';

// Extract token from request
function extractToken(req) {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  // Check API key header
  if (req.headers['x-api-key']) {
    return req.headers['x-api-key'];
  }
  
  return null;
}

// Authenticate request
async function authenticate(req, res, next) {
  // Skip authentication if disabled
  if (!authEnabled) {
    return next();
  }

  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Try JWT token first
  const decoded = verifyToken(token);
  if (decoded) {
    req.user = decoded;
    return next();
  }

  // Try API key
  const apiKey = apiKeys.find(key => key.key === token);
  if (apiKey) {
    // Check if API key is expired
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'API key expired' });
    }
    
    // Update last used
    apiKey.lastUsed = new Date().toISOString();
    
    // Get user for this API key
    const user = users.find(u => u.id === apiKey.userId);
    if (user) {
      req.user = { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        authMethod: 'apikey' 
      };
      return next();
    }
  }

  return res.status(401).json({ error: 'Invalid or expired token' });
}

// Require admin role
function requireAdmin(req, res, next) {
  if (!authEnabled) {
    return next();
  }

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}

// Optional authentication (sets req.user if authenticated, but doesn't require it)
function optionalAuth(req, res, next) {
  if (!authEnabled) {
    return next();
  }

  const token = extractToken(req);
  
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  
  next();
}

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth,
  authEnabled
};
