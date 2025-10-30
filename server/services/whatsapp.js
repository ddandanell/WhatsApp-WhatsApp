const axios = require('axios');

class WhatsAppService {
  constructor() {
    // API key and URL now loaded from database
  }

  /**
   * Get API key from database or environment
   * @returns {string}
   */
  getApiKey() {
    try {
      const models = require('../database/models');
      const dbKey = models.settings.get('wasender_api_key');
      return dbKey || process.env.WASENDER_API_KEY || '';
    } catch (error) {
      console.warn('⚠️  Could not load Wasender API key from database, using .env');
      return process.env.WASENDER_API_KEY || '';
    }
  }

  /**
   * Get API URL from database or environment
   * @returns {string}
   */
  getApiUrl() {
    try {
      const models = require('../database/models');
      const dbUrl = models.settings.get('wasender_api_url');
      return dbUrl || process.env.WASENDER_API_URL || 'https://wasenderapi.com/api';
    } catch (error) {
      console.warn('⚠️  Could not load Wasender API URL from database, using .env');
      return process.env.WASENDER_API_URL || 'https://wasenderapi.com/api';
    }
  }

  /**
   * Send a message via WasenderAPI
   * @param {string} phoneNumber - Recipient phone number (with country code, e.g., +1234567890)
   * @param {string} message - Message text to send
   * @returns {Promise<Object>} - API response
   */
  async sendMessage(phoneNumber, message) {
    try {
      const apiKey = this.getApiKey();
      const apiUrl = this.getApiUrl();
      
      if (!apiKey) {
        throw new Error('WasenderAPI key not configured. Please add it in Settings → API Configuration');
      }

      // Format phone number according to WasenderAPI requirements
      // Remove all non-numeric characters except +
      let formattedNumber = this.formatPhoneNumber(phoneNumber);

      console.log(`📤 Sending message to ${formattedNumber}...`);

      const response = await axios.post(
        `${apiUrl}/send-message`,
        {
          to: formattedNumber,
          text: message
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000 // 15 second timeout
        }
      );

      console.log('✅ Message sent successfully:', response.data);
      return {
        success: true,
        data: response.data,
        messageId: response.data?.data?.id || response.data?.id
      };

    } catch (error) {
      console.error('❌ WhatsApp send error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid WasenderAPI key');
      } else if (error.response?.status === 429) {
        throw new Error('WasenderAPI rate limit exceeded');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('WasenderAPI request timeout');
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }

  /**
   * Check session status (according to WasenderAPI docs)
   * @returns {Promise<Object>}
   */
  async getSessionStatus() {
    try {
      const apiKey = this.getApiKey();
      const apiUrl = this.getApiUrl();
      
      const response = await axios.get(
        `${apiUrl}/status`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get session status:', error.message);
      return { status: 'unknown', error: error.message };
    }
  }

  /**
   * Check if a phone number is on WhatsApp (according to WasenderAPI docs)
   * @param {string} phoneNumber
   * @returns {Promise<boolean>}
   */
  async checkNumberOnWhatsApp(phoneNumber) {
    try {
      const apiKey = this.getApiKey();
      const apiUrl = this.getApiUrl();
      const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
      
      const response = await axios.get(
        `${apiUrl}/on-whatsapp/${cleanNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      return response.data?.data?.exists || false;
    } catch (error) {
      console.error('❌ Failed to check number on WhatsApp:', error.message);
      return false;
    }
  }

  /**
   * Test the WhatsApp API connection
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      // Check session status
      const status = await this.getSessionStatus();
      console.log('📡 Session status:', status);
      return status.status === 'connected';
    } catch (error) {
      console.error('WhatsApp connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Format phone number to international format
   * @param {string} phoneNumber
   * @returns {string}
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-numeric characters except +
    let formatted = phoneNumber.replace(/[^\d+]/g, '');
    
    // Add + if not present
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    
    return formatted;
  }
}

module.exports = new WhatsAppService();

