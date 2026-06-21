-- Migration 003: Store custom energy work catalogs on VPS database
CREATE TABLE IF NOT EXISTS energy_work_catalogs (
  user_id TEXT NOT NULL DEFAULT 'default',
  catalog_type TEXT NOT NULL, -- 'sensations', 'phenomena', 'fatuistica'
  items TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, catalog_type)
);
