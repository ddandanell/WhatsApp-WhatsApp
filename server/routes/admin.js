const express = require('express');
const router = express.Router();
const models = require('../database/models');
const { knowledgeValidation, settingsValidation } = require('../middleware/validator');

// ============= Knowledge Base Routes =============

// Get all knowledge entries
router.get('/knowledge', (req, res) => {
  try {
    const entries = models.knowledge.getAll();
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search knowledge base
router.get('/knowledge/search', (req, res) => {
  try {
    const query = req.query.q || '';
    const results = models.knowledge.search(query);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single knowledge entry
router.get('/knowledge/:id', (req, res) => {
  try {
    const entry = models.knowledge.getById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, error: 'Entry not found' });
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create knowledge entry
router.post('/knowledge', knowledgeValidation.create, (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const id = models.knowledge.create(title, content, category, tags);
    res.json({ success: true, id, message: 'Knowledge entry created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update knowledge entry
router.put('/knowledge/:id', knowledgeValidation.update, (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    models.knowledge.update(req.params.id, title, content, category, tags);
    res.json({ success: true, message: 'Knowledge entry updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete knowledge entry
router.delete('/knowledge/:id', knowledgeValidation.delete, (req, res) => {
  try {
    models.knowledge.delete(req.params.id);
    res.json({ success: true, message: 'Knowledge entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all categories
router.get('/categories', (req, res) => {
  try {
    const categories = models.knowledge.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= Settings Routes =============

// Get all settings
router.get('/settings', (req, res) => {
  try {
    const settings = models.settings.getAll();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update settings
router.post('/settings', settingsValidation.update, (req, res) => {
  try {
    models.settings.setMultiple(req.body);
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= Message History Routes =============

// Get all messages
router.get('/messages', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const messages = models.messages.getAll(limit);
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get messages by phone number
router.get('/messages/:phoneNumber', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const messages = models.messages.getByNumber(req.params.phoneNumber, limit);
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get message statistics
router.get('/stats', (req, res) => {
  try {
    const stats = models.messages.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= Whitelist Routes =============

// Get all whitelisted numbers
router.get('/whitelist', (req, res) => {
  try {
    const whitelist = models.whitelist.getAll();
    res.json({ success: true, data: whitelist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check if number is whitelisted
router.get('/whitelist/check/:phoneNumber', (req, res) => {
  try {
    const isWhitelisted = models.whitelist.isWhitelisted(req.params.phoneNumber);
    res.json({ success: true, whitelisted: isWhitelisted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add number to whitelist
router.post('/whitelist', (req, res) => {
  try {
    const { phone_number, name, notes } = req.body;
    
    if (!phone_number) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }
    
    const id = models.whitelist.add(phone_number, name || '', notes || '');
    
    if (id === null) {
      return res.json({ success: true, message: 'Number already whitelisted', alreadyExists: true });
    }
    
    res.json({ success: true, id, message: 'Number added to whitelist successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove number from whitelist
router.delete('/whitelist/:phoneNumber', (req, res) => {
  try {
    models.whitelist.remove(req.params.phoneNumber);
    res.json({ success: true, message: 'Number removed from whitelist successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update whitelist entry
router.put('/whitelist/:phoneNumber', (req, res) => {
  try {
    const { name, notes } = req.body;
    models.whitelist.update(req.params.phoneNumber, name || '', notes || '');
    res.json({ success: true, message: 'Whitelist entry updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

