const models = require('../database/models');

class KnowledgeService {
  /**
   * Get relevant knowledge based on a query
   * @param {string} query - User's message/query
   * @returns {string} - Formatted knowledge context
   */
  getRelevantKnowledge(query) {
    try {
      // Get all knowledge entries
      const allKnowledge = models.knowledge.getAll();
      
      if (allKnowledge.length === 0) {
        return '';
      }

      // Simple relevance scoring based on keyword matching
      const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      
      const scoredKnowledge = allKnowledge.map(entry => {
        const searchableText = `${entry.title} ${entry.content} ${entry.tags}`.toLowerCase();
        let score = 0;
        
        // Count matching words
        queryWords.forEach(word => {
          if (searchableText.includes(word)) {
            score++;
          }
        });
        
        return { ...entry, score };
      });

      // Sort by score and get top results
      const relevantEntries = scoredKnowledge
        .filter(entry => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // Get top 5 most relevant

      if (relevantEntries.length === 0) {
        // If no specific matches, return a few random entries
        return this.formatKnowledge(allKnowledge.slice(0, 3));
      }

      return this.formatKnowledge(relevantEntries);

    } catch (error) {
      console.error('Error getting relevant knowledge:', error);
      return '';
    }
  }

  /**
   * Format knowledge entries for AI context
   * @param {Array} entries - Knowledge entries
   * @returns {string} - Formatted context
   */
  formatKnowledge(entries) {
    if (entries.length === 0) {
      return '';
    }

    return entries.map(entry => {
      return `[${entry.category}] ${entry.title}\n${entry.content}`;
    }).join('\n\n---\n\n');
  }

  /**
   * Get all knowledge as a single context
   * @returns {string}
   */
  getAllKnowledge() {
    try {
      const allKnowledge = models.knowledge.getAll();
      return this.formatKnowledge(allKnowledge);
    } catch (error) {
      console.error('Error getting all knowledge:', error);
      return '';
    }
  }

  /**
   * Get knowledge statistics
   * @returns {Object}
   */
  getStats() {
    try {
      const allKnowledge = models.knowledge.getAll();
      const categories = models.knowledge.getAllCategories();
      
      return {
        totalEntries: allKnowledge.length,
        categories: categories.length,
        lastUpdated: allKnowledge[0]?.updated_at || null
      };
    } catch (error) {
      console.error('Error getting knowledge stats:', error);
      return {
        totalEntries: 0,
        categories: 0,
        lastUpdated: null
      };
    }
  }
}

module.exports = new KnowledgeService();

