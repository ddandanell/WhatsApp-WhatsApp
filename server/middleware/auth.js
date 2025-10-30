const models = require('../database/models');

// Simple session storage (in-memory)
const sessions = new Set();

/**
 * Generate a simple session token
 */
function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Authenticate user with username and password
 */
function authenticateUser(username, password) {
  const storedUsername = models.settings.get('admin_username') || 'admin';
  const storedPassword = models.settings.get('admin_password') || 'admin';
  
  return username === storedUsername && password === storedPassword;
}

/**
 * Create a new session
 */
function createSession() {
  const token = generateToken();
  sessions.add(token);
  return token;
}

/**
 * Check if session is valid
 */
function isValidSession(token) {
  return sessions.has(token);
}

/**
 * Destroy a session
 */
function destroySession(token) {
  sessions.delete(token);
}

/**
 * Middleware to protect routes
 */
function authenticate(req, res, next) {
  // Check for session token in cookie or header
  const token = req.cookies?.session || req.headers['x-session-token'];
  
  if (token && isValidSession(token)) {
    req.authenticated = true;
    return next();
  }
  
  // Not authenticated
  return res.status(401).json({ 
    success: false, 
    error: 'Not authenticated. Please login.' 
  });
}

module.exports = {
  authenticate,
  authenticateUser,
  createSession,
  destroySession,
  isValidSession
};
