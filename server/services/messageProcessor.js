const models = require('../database/models');
const grokService = require('./grok');
const whatsappService = require('./whatsapp');
const knowledgeService = require('./knowledge');

class MessageProcessor {
  /**
   * Process an incoming WhatsApp message
   * @param {string} phoneNumber - Sender's phone number
   * @param {string} messageText - Message content
   */
  async processMessage(phoneNumber, messageText) {
    const startTime = Date.now();
    
    console.log('');
    console.log('='.repeat(60));
    console.log(`📨 Processing message from ${phoneNumber}`);
    console.log(`💬 Message: "${messageText}"`);
    console.log('='.repeat(60));

    try {
      // 1. Log the incoming message
      const messageId = models.messages.create(phoneNumber, messageText);
      console.log(`✅ Message logged (ID: ${messageId})`);

      // 2. Check whitelist
      const isWhitelisted = models.whitelist.isWhitelisted(phoneNumber);
      
      if (!isWhitelisted) {
        console.log(`🚫 Number ${phoneNumber} is NOT on whitelist. Message logged for manual review.`);
        return;
      }
      
      console.log(`✅ Number ${phoneNumber} is whitelisted. Processing auto-reply...`);

      // 3. Check if auto-reply is enabled
      const autoReplyEnabled = models.settings.get('auto_reply_enabled') === 'true';
      
      if (!autoReplyEnabled) {
        console.log('⏸️  Auto-reply is disabled. Message logged only.');
        return;
      }

      // 4. Check active hours
      if (!this.isWithinActiveHours()) {
        console.log('⏰ Outside active hours. Message logged only.');
        return;
      }

      // 5. Apply response delay
      const responseDelay = parseInt(models.settings.get('response_delay')) || 0;
      if (responseDelay > 0) {
        console.log(`⏳ Waiting ${responseDelay} seconds before responding...`);
        await this.sleep(responseDelay * 1000);
      }

      // 6. Get relevant knowledge
      console.log('📚 Searching knowledge base...');
      const knowledgeContext = knowledgeService.getRelevantKnowledge(messageText);
      
      if (knowledgeContext) {
        console.log('✅ Relevant knowledge found');
      } else {
        console.log('ℹ️  No specific knowledge found, using general context');
      }

      // 7. Get AI settings and personalization
      const systemPrompt = models.settings.get('system_prompt');
      const temperature = parseFloat(models.settings.get('ai_temperature')) || 0.8;
      
      const personalization = {
        my_name: models.settings.get('my_name') || '',
        my_personality: models.settings.get('my_personality') || '',
        my_writing_style: models.settings.get('my_writing_style') || '',
        my_common_phrases: models.settings.get('my_common_phrases') || ''
      };

      // 8. Generate AI response
      console.log('🤖 Generating AI response...');
      const aiResponse = await grokService.generateResponse(
        messageText,
        knowledgeContext,
        systemPrompt,
        temperature,
        personalization
      );

      console.log(`💡 AI Response: "${aiResponse.substring(0, 100)}${aiResponse.length > 100 ? '...' : ''}"`);

      // 8. Send response via WhatsApp
      console.log('📤 Sending response...');
      const sendResult = await whatsappService.sendMessage(phoneNumber, aiResponse);

      if (sendResult.success) {
        // 9. Update message history with response
        const responseTime = (Date.now() - startTime) / 1000; // in seconds
        const knowledgeUsed = knowledgeContext ? 'Yes' : 'No';
        
        models.messages.updateResponse(messageId, aiResponse, responseTime, knowledgeUsed);
        
        console.log('✅ Message processed successfully!');
        console.log(`⏱️  Total processing time: ${responseTime.toFixed(2)}s`);
        console.log('='.repeat(60));
        console.log('');
      } else {
        console.error('❌ Failed to send WhatsApp message');
        console.log('='.repeat(60));
        console.log('');
      }

    } catch (error) {
      console.error('❌ Error processing message:', error.message);
      console.error(error.stack);
      console.log('='.repeat(60));
      console.log('');
      
      // Optionally send an error message back
      // await whatsappService.sendMessage(phoneNumber, 'Sorry, I encountered an error processing your message. Please try again later.');
    }
  }

  /**
   * Check if current time is within active hours
   * @returns {boolean}
   */
  isWithinActiveHours() {
    try {
      const startTime = models.settings.get('active_hours_start') || '00:00';
      const endTime = models.settings.get('active_hours_end') || '23:59';

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [startHours, startMins] = startTime.split(':').map(Number);
      const [endHours, endMins] = endTime.split(':').map(Number);

      const startMinutes = startHours * 60 + startMins;
      const endMinutes = endHours * 60 + endMins;

      // Handle cases where end time is on the next day
      if (endMinutes < startMinutes) {
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      }

      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;

    } catch (error) {
      console.error('Error checking active hours:', error);
      return true; // Default to allowing replies if there's an error
    }
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new MessageProcessor();

