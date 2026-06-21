-- Migration 004: Store custom AI cognitive settings and documents on VPS database
CREATE TABLE IF NOT EXISTS ai_cognitive_settings (
  user_id TEXT PRIMARY KEY DEFAULT 'default',
  global_personality TEXT NOT NULL,
  temperature NUMERIC NOT NULL DEFAULT 0.7,
  selected_model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  knowledge_constraint TEXT NOT NULL DEFAULT 'flexible',
  knowledge_docs TEXT NOT NULL DEFAULT '[]', -- JSON string of KnowledgeDoc[]
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
