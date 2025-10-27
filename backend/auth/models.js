// In-memory user storage (for MVP - can be replaced with database later)
const users = [];
const apiKeys = [];

// User model structure
class User {
  constructor({ id, username, password, email, role = 'user', authMethod = 'local', createdAt = new Date().toISOString() }) {
    this.id = id;
    this.username = username;
    this.password = password; // hashed password for local auth
    this.email = email;
    this.role = role; // 'admin' or 'user'
    this.authMethod = authMethod; // 'local', 'oidc', 'ldap'
    this.createdAt = createdAt;
    this.updatedAt = createdAt;
  }
}

// API Key model structure
class ApiKey {
  constructor({ id, userId, key, name, createdAt = new Date().toISOString(), expiresAt = null }) {
    this.id = id;
    this.userId = userId;
    this.key = key; // hashed key
    this.name = name;
    this.createdAt = createdAt;
    this.expiresAt = expiresAt;
    this.lastUsed = null;
  }
}

module.exports = {
  users,
  apiKeys,
  User,
  ApiKey
};
