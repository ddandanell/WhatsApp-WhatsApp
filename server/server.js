require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Initialize database
require('./database/init');

// Import routes
const webhookRoutes = require('./routes/webhook');
const adminRoutes = require('./routes/admin');
const authenticate = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ============= Middleware =============

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting for webhook
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Rate limiting for admin API
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP'
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============= Routes =============

// Serve static files (admin interface)
app.use(express.static(path.join(__dirname, '../public')));

// Webhook routes (no auth required for incoming messages)
app.use('/webhook', webhookLimiter, webhookRoutes);

// Admin API routes (no authentication for testing)
app.use('/api', adminLimiter, adminRoutes);

// Serve admin interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ============= Start Server =============

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 WhatsApp AI Assistant Server Started');
  console.log('='.repeat(50));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook/whatsapp`);
  console.log(`🔧 Admin Interface: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('');
  console.log('⚙️  Configuration:');
  console.log(`   - Database: ${process.env.DATABASE_PATH || './data/assistant.db'}`);
  console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   - WhatsApp API: ${process.env.WASENDER_API_URL || 'Not configured'}`);
  console.log(`   - Grok AI: ${process.env.GROK_API_URL || 'Not configured'}`);
  console.log('');
  console.log('✅ Ready to receive messages!');
  console.log('='.repeat(50));
});

module.exports = app;

