const express = require('express');
const router = express.Router();
const messageProcessor = require('../services/messageProcessor');

// Webhook endpoint for receiving WhatsApp messages
router.post('/whatsapp', async (req, res) => {
  try {
    console.log('📨 Webhook received:', JSON.stringify(req.body, null, 2));
    
    // Send immediate response to acknowledge receipt (required by WasenderAPI)
    res.status(200).json({ status: 'received' });

    // Process message asynchronously
    // According to WasenderAPI documentation, webhooks can have different event types
    const { event, data } = req.body;

    // Handle different webhook events
    if (event === 'messages.received' || event === 'messages.upsert') {
      // Extract message data from webhook payload
      const message = data?.messages?.[0] || data || req.body;
      
      // Get phone number from various possible fields
      const phoneNumber = message.from || message.key?.remoteJid || req.body.from;
      
      // Get message text from various possible fields
      const messageText = 
        message.message?.conversation || 
        message.message?.extendedTextMessage?.text ||
        message.text || 
        message.body ||
        req.body.text ||
        req.body.body ||
        '';

      // Only process if it's an incoming message (not from us)
      const isFromMe = message.key?.fromMe || message.fromMe || false;

      if (!phoneNumber || !messageText) {
        console.log('⚠️  Invalid webhook payload - missing phone number or message text');
        return;
      }

      if (isFromMe) {
        console.log('⏩ Skipping message sent by us');
        return;
      }

      // Clean phone number (remove @s.whatsapp.net suffix if present)
      const cleanNumber = phoneNumber.replace('@s.whatsapp.net', '').replace('@c.us', '');

      console.log(`📥 Processing incoming message from ${cleanNumber}`);

      // Process the message in the background
      messageProcessor.processMessage(cleanNumber, messageText)
        .catch(error => {
          console.error('❌ Error processing message:', error);
        });

    } else if (event === 'session.status') {
      console.log('📡 Session status update:', data);
    } else {
      console.log(`ℹ️  Received webhook event: ${event}`);
    }

  } catch (error) {
    console.error('❌ Webhook error:', error);
    // Still return 200 to prevent webhook retries
    res.status(200).json({ status: 'error', message: error.message });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;

