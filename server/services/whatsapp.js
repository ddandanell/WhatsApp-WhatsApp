const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.apiKey = process.env.WASENDER_API_KEY;
    this.apiUrl = process.env.WASENDER_API_URL || 'https://wasenderapi.com/api';
    
    if (!this.apiKey) {
      console.warn('⚠️  WasenderAPI key not configured');
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
      if (!this.apiKey) {
        throw new Error('WasenderAPI key not configured');
      }

      // Format phone number according to WasenderAPI requirements
      // Remove all non-numeric characters except +
      let formattedNumber = this.formatPhoneNumber(phoneNumber);

      console.log(`📤 Sending message to ${formattedNumber}...`);

      const response = await axios.post(
        `${this.apiUrl}/send-message`,
        {
          to: formattedNumber,
          text: message
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
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
      const response = await axios.get(
        `${this.apiUrl}/status`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
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
      const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
      const response = await axios.get(
        `${this.apiUrl}/on-whatsapp/${cleanNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
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

