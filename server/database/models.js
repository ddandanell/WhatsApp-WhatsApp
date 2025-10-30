const db = require('./init');

// Knowledge Base Operations
const knowledgeOperations = {
  getAll: () => {
    return db.prepare('SELECT * FROM knowledge_base ORDER BY updated_at DESC').all();
  },

  getById: (id) => {
    return db.prepare('SELECT * FROM knowledge_base WHERE id = ?').get(id);
  },

  search: (query) => {
    const searchTerm = `%${query}%`;
    return db.prepare(`
      SELECT * FROM knowledge_base 
      WHERE title LIKE ? OR content LIKE ? OR tags LIKE ?
      ORDER BY updated_at DESC
    `).all(searchTerm, searchTerm, searchTerm);
  },

  create: (title, content, category = 'General', tags = '') => {
    const stmt = db.prepare(`
      INSERT INTO knowledge_base (title, content, category, tags)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(title, content, category, tags);
    return result.lastInsertRowid;
  },

  update: (id, title, content, category, tags) => {
    const stmt = db.prepare(`
      UPDATE knowledge_base 
      SET title = ?, content = ?, category = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(title, content, category, tags, id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM knowledge_base WHERE id = ?').run(id);
  },

  getAllCategories: () => {
    return db.prepare('SELECT DISTINCT category FROM knowledge_base ORDER BY category').all();
  }
};

// Settings Operations
const settingsOperations = {
  get: (key) => {
    const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return result ? result.value : null;
  },

  getAll: () => {
    const rows = db.prepare('SELECT * FROM settings').all();
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    return settings;
  },

  set: (key, value) => {
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    return stmt.run(key, value);
  },

  setMultiple: (settingsObj) => {
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(settingsObj)) {
        stmt.run(key, value);
      }
    });
    transaction();
  }
};

// Message History Operations
const messageOperations = {
  getAll: (limit = 100) => {
    return db.prepare('SELECT * FROM message_history ORDER BY timestamp DESC LIMIT ?').all(limit);
  },

  getByNumber: (phoneNumber, limit = 50) => {
    return db.prepare(`
      SELECT * FROM message_history 
      WHERE from_number = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `).all(phoneNumber, limit);
  },

  create: (fromNumber, messageText) => {
    const stmt = db.prepare(`
      INSERT INTO message_history (from_number, message_text, status)
      VALUES (?, ?, 'received')
    `);
    const result = stmt.run(fromNumber, messageText);
    return result.lastInsertRowid;
  },

  updateResponse: (id, responseText, responseTime, knowledgeUsed = '') => {
    const stmt = db.prepare(`
      UPDATE message_history 
      SET response_text = ?, response_time = ?, knowledge_used = ?, status = 'replied'
      WHERE id = ?
    `);
    return stmt.run(responseText, responseTime, knowledgeUsed, id);
  },

  getStats: () => {
    const totalMessages = db.prepare('SELECT COUNT(*) as count FROM message_history').get().count;
    const repliedMessages = db.prepare("SELECT COUNT(*) as count FROM message_history WHERE status = 'replied'").get().count;
    const avgResponseTime = db.prepare('SELECT AVG(response_time) as avg FROM message_history WHERE response_time IS NOT NULL').get().avg || 0;
    
    return {
      total: totalMessages,
      replied: repliedMessages,
      pending: totalMessages - repliedMessages,
      avgResponseTime: avgResponseTime.toFixed(2)
    };
  }
};

// Whitelist Operations
const whitelistOperations = {
  getAll: () => {
    return db.prepare('SELECT * FROM whitelist ORDER BY added_at DESC').all();
  },

  isWhitelisted: (phoneNumber) => {
    const result = db.prepare('SELECT COUNT(*) as count FROM whitelist WHERE phone_number = ?').get(phoneNumber);
    return result.count > 0;
  },

  add: (phoneNumber, name = '', notes = '') => {
    try {
      const stmt = db.prepare('INSERT INTO whitelist (phone_number, name, notes) VALUES (?, ?, ?)');
      const result = stmt.run(phoneNumber, name, notes);
      return result.lastInsertRowid;
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        return null; // Already exists
      }
      throw error;
    }
  },

  remove: (phoneNumber) => {
    return db.prepare('DELETE FROM whitelist WHERE phone_number = ?').run(phoneNumber);
  },

  update: (phoneNumber, name, notes) => {
    return db.prepare('UPDATE whitelist SET name = ?, notes = ? WHERE phone_number = ?').run(name, notes, phoneNumber);
  }
};

module.exports = {
  knowledge: knowledgeOperations,
  settings: settingsOperations,
  messages: messageOperations,
  whitelist: whitelistOperations
};

