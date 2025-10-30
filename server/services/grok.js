const axios = require('axios');

class GrokService {
  constructor() {
    this.apiUrl = 'https://api.x.ai/v1';
  }

  /**
   * Get API key from database or environment
   * @returns {string}
   */
  getApiKey() {
    try {
      const models = require('../database/models');
      const dbKey = models.settings.get('grok_api_key');
      return dbKey || process.env.GROK_API_KEY || '';
    } catch (error) {
      console.warn('⚠️  Could not load Grok API key from database, using .env');
      return process.env.GROK_API_KEY || '';
    }
  }

  /**
   * Generate a response using Grok AI
   * @param {string} userMessage - The user's message
   * @param {string} knowledgeContext - Relevant knowledge base context
   * @param {string} systemPrompt - Custom system prompt
   * @param {number} temperature - AI creativity (0-1)
   * @param {object} personalization - User personalization settings
   * @returns {Promise<string>} - AI generated response
   */
  async generateResponse(userMessage, knowledgeContext = '', systemPrompt = '', temperature = 0.7, personalization = {}) {
    try {
      const apiKey = this.getApiKey();
      
      if (!apiKey) {
        throw new Error('Grok API key not configured. Please add it in Settings → API Configuration');
      }

      // Build the context message with personalization
      let contextMessage = systemPrompt || 'You are ME. Write as I would write.';
      
      // Add personalization details
      if (personalization.my_name) {
        contextMessage += `\n\nMy name is: ${personalization.my_name}`;
      }
      if (personalization.my_personality) {
        contextMessage += `\n\nMy personality: ${personalization.my_personality}`;
      }
      if (personalization.my_writing_style) {
        contextMessage += `\n\nMy writing style: ${personalization.my_writing_style}`;
      }
      if (personalization.my_common_phrases) {
        contextMessage += `\n\nPhrases I commonly use: ${personalization.my_common_phrases}`;
      }
      
      if (knowledgeContext) {
        contextMessage += '\n\n=== MY KNOWLEDGE/INFO ===\n' + knowledgeContext + '\n=== END KNOWLEDGE ===\n\n';
        contextMessage += 'Use this information naturally in my responses when relevant. Respond as if I am texting them myself.';
      }

      const messages = [
        {
          role: 'system',
          content: contextMessage
        },
        {
          role: 'user',
          content: userMessage
        }
      ];

      console.log('🤖 Calling Grok AI...');
      
      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: 'grok-3',
          messages: messages,
          temperature: parseFloat(temperature),
          max_tokens: 500,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const aiResponse = response.data.choices[0].message.content;
        console.log('✅ Grok AI response received');
        return aiResponse;
      } else {
        throw new Error('Invalid response from Grok AI');
      }

    } catch (error) {
      console.error('❌ Grok AI error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Grok API key');
      } else if (error.response?.status === 429) {
        throw new Error('Grok API rate limit exceeded');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Grok API request timeout');
      }
      
      throw new Error(`Grok AI error: ${error.message}`);
    }
  }

  /**
   * Test the Grok API connection
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      const response = await this.generateResponse('Hello, this is a test message.', '', 'Reply with just "OK" if you receive this.', 0.1);
      return response.length > 0;
    } catch (error) {
      console.error('Grok connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = new GrokService();

