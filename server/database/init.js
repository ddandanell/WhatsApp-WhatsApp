const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || './data/assistant.db';
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
  // Knowledge Base table
  db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      tags TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Message History table
  db.exec(`
    CREATE TABLE IF NOT EXISTS message_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_number TEXT NOT NULL,
      message_text TEXT NOT NULL,
      response_text TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      response_time REAL,
      knowledge_used TEXT,
      status TEXT DEFAULT 'pending'
    )
  `);

  // Whitelist table
  db.exec(`
    CREATE TABLE IF NOT EXISTS whitelist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT UNIQUE NOT NULL,
      name TEXT,
      notes TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default settings if they don't exist
  const defaultSettings = [
    { key: 'auto_reply_enabled', value: 'true' },
    { key: 'response_delay', value: '4' },
    { key: 'active_hours_start', value: '00:00' },
    { key: 'active_hours_end', value: '23:59' },
    { key: 'response_mode', value: 'always' },
    { key: 'ai_temperature', value: '0.8' },
    { key: 'system_prompt', value: 'You are ME. Write EXACTLY as I would write - in first person, using my voice, my tone, my style. Never reveal you are AI. Respond naturally as if I am personally typing these messages. Keep responses conversational and personal. Use my speaking patterns. Be warm but authentic. Vary response length naturally - sometimes short, sometimes longer. Use casual language when appropriate. Sound human, spontaneous, and genuine. Make it feel like real text messages from me, not from a bot.' },
    { key: 'my_name', value: '' },
    { key: 'my_personality', value: 'Friendly, casual, warm' },
    { key: 'my_common_phrases', value: '' },
    { key: 'my_writing_style', value: 'Conversational, personal, natural' }
  ];

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  
  for (const setting of defaultSettings) {
    insertSetting.run(setting.key, setting.value);
  }

  console.log('✅ Database initialized successfully');
}

// Initialize the database
initializeDatabase();

module.exports = db;

