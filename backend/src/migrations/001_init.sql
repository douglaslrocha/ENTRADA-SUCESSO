-- Migration 001: Initialization for SQLite

CREATE TABLE IF NOT EXISTS diary_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  location TEXT,
  status TEXT DEFAULT 'active',
  start_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title TEXT,
  temp TEXT,
  waves TEXT,
  rating TEXT,
  main_image TEXT,
  event_title TEXT,
  event_date TEXT,
  event_image TEXT,
  circle_image TEXT,
  description TEXT,
  categories TEXT DEFAULT '[]',
  gallery TEXT DEFAULT '[]',
  time TEXT,
  day TEXT,
  month TEXT,
  month_name TEXT,
  year TEXT,
  weekday TEXT,
  end_at TEXT,
  duration INTEGER DEFAULT 0,
  day_opening TEXT DEFAULT '{}',
  dreams TEXT DEFAULT '[]',
  actions TEXT DEFAULT '[]',
  habits TEXT DEFAULT '[]',
  insights TEXT DEFAULT '[]',
  state TEXT DEFAULT '{}',
  guidance TEXT DEFAULT '{}',
  day_synthesis TEXT DEFAULT '{}',
  semantic_entities TEXT DEFAULT '{}',
  blocks TEXT DEFAULT '[]',
  essential_actions TEXT DEFAULT '[]',
  recurring_actions TEXT DEFAULT '[]',
  tomorrow_actions TEXT DEFAULT '[]',
  content TEXT,
  insights_content TEXT,
  guidance_content TEXT,
  consolidation_content TEXT,
  free_content TEXT,
  posture TEXT DEFAULT '[]',
  mental TEXT DEFAULT '[]',
  emotion TEXT DEFAULT '[]',
  energy TEXT DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_diary_entries_user ON diary_entries(user_id);

CREATE TABLE IF NOT EXISTS objectives (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT DEFAULT 'Estratégico',
  deadline TEXT,
  media TEXT DEFAULT '[]',
  burning_desire TEXT DEFAULT '',
  sacrifice TEXT DEFAULT '',
  feelings TEXT DEFAULT '',
  plan TEXT DEFAULT '',
  kpis TEXT DEFAULT '[]',
  risks TEXT DEFAULT '[]',
  metas TEXT DEFAULT '[]',
  goal_ids TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_objectives_user ON objectives(user_id);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  objective_id TEXT NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'not_started',
  deadline TEXT,
  progress INTEGER DEFAULT 0,
  project_ids TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_goals_objective ON goals(objective_id);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  goal_id TEXT REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'not_started',
  deadline TEXT,
  progress INTEGER DEFAULT 0,
  task_ids TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  goal_id TEXT REFERENCES goals(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'todo',
  date TEXT,
  estimated_duration TEXT DEFAULT '',
  actual_duration INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  image_url TEXT,
  completed_at TEXT,
  document_ids TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS financial_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  value NUMERIC NOT NULL,
  category_id TEXT NOT NULL REFERENCES financial_categories(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_projections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL DEFAULT 'default',
  category_id TEXT NOT NULL REFERENCES financial_categories(id) ON DELETE CASCADE,
  allowed_value NUMERIC NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category_id, month, year)
);

CREATE TABLE IF NOT EXISTS financial_mural (
  user_id TEXT PRIMARY KEY DEFAULT 'default',
  net_worth TEXT DEFAULT '{"current_cash": 0.00}',
  assets TEXT DEFAULT '[]',
  vault TEXT DEFAULT '[]',
  links TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  is_pinned INTEGER DEFAULT 0,
  is_hidden INTEGER DEFAULT 0,
  color TEXT DEFAULT '#000000',
  icon TEXT DEFAULT '📄',
  icon_type TEXT DEFAULT 'emoji',
  image_url TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_pinned INTEGER DEFAULT 0,
  color TEXT DEFAULT '#000000',
  icon TEXT DEFAULT '📄',
  icon_type TEXT DEFAULT 'emoji',
  image_url TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  is_pinned INTEGER DEFAULT 0,
  cover_image TEXT,
  cover_position NUMERIC DEFAULT 50.00,
  icon TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
