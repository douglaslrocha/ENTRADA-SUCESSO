-- ==========================================
-- SCRIPT DE INICIALIZAÇÃO DO SUPABASE
-- Crie estas tabelas no Painel SQL do Supabase
-- ==========================================

-- 1. DIÁRIO DE BORDO
CREATE TABLE IF NOT EXISTS diary_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  start_at TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
  "time" TEXT,
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

-- 2. CATEGORIAS FINANCEIRAS
CREATE TABLE IF NOT EXISTS financial_categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- 3. TRANSAÇÕES FINANCEIRAS
CREATE TABLE IF NOT EXISTS financial_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  value NUMERIC NOT NULL,
  category_id TEXT NOT NULL REFERENCES financial_categories(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. PROJEÇÕES FINANCEIRAS
CREATE TABLE IF NOT EXISTS financial_projections (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  category_id TEXT NOT NULL REFERENCES financial_categories(id) ON DELETE CASCADE,
  allowed_value NUMERIC NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category_id, month, year)
);

-- 5. MURAL FINANCEIRO
CREATE TABLE IF NOT EXISTS financial_mural (
  user_id TEXT PRIMARY KEY DEFAULT 'default',
  net_worth TEXT DEFAULT '{"current_cash": 0.00}',
  assets TEXT DEFAULT '[]',
  vault TEXT DEFAULT '[]',
  links TEXT DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. WORKSPACES
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. PASTAS (FOLDERS)
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. PÁGINAS (DOCUMENTS)
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. OBJETIVOS
CREATE TABLE IF NOT EXISTS objetivos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  title TEXT NOT NULL,
  burning_desire TEXT NOT NULL DEFAULT '',
  feeling_of_achievement TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium',
  manifestation_status TEXT NOT NULL DEFAULT 'conception',
  sacrifice TEXT NOT NULL DEFAULT '',
  action_plan TEXT NOT NULL DEFAULT '',
  start_date TEXT,
  deadline TEXT,
  mental_recurrence INTEGER DEFAULT 0,
  manifestation_images TEXT DEFAULT '[]',
  motivational_videos TEXT DEFAULT '[]',
  evolutionary_context TEXT NOT NULL DEFAULT '',
  risks TEXT DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_objetivos_user ON objetivos(user_id);

-- 10. METAS
CREATE TABLE IF NOT EXISTS metas (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  objetivo_id TEXT NOT NULL REFERENCES objetivos(id) ON DELETE CASCADE,
  intention TEXT NOT NULL,
  description TEXT,
  meaning TEXT NOT NULL DEFAULT '',
  expected_evolution TEXT NOT NULL DEFAULT '',
  deadline TEXT,
  consequence TEXT NOT NULL DEFAULT '',
  risks TEXT NOT NULL DEFAULT '',
  impact_level TEXT NOT NULL DEFAULT 'medium',
  strategy TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#c3b1e1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_metas_objetivo ON metas(objetivo_id);

-- 11. TAREFAS
CREATE TABLE IF NOT EXISTS tarefas (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  meta_id TEXT NOT NULL REFERENCES metas(id) ON DELETE CASCADE,
  parent_task_id TEXT REFERENCES tarefas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  execution_type TEXT NOT NULL DEFAULT 'standard',
  description TEXT,
  visual_anchor_url TEXT,
  status TEXT DEFAULT 'todo',
  complexity TEXT DEFAULT 'low',
  subtasks TEXT DEFAULT '[]',
  scheduled_date TEXT,
  estimated_duration TEXT DEFAULT '',
  actual_duration INTEGER DEFAULT 0,
  is_recurring INTEGER DEFAULT 0,
  recurrence_pattern TEXT,
  recurrence_days TEXT DEFAULT '[]',
  parent_recurrence_id TEXT,
  priority TEXT DEFAULT 'medium',
  strategic_impact TEXT DEFAULT 'medium',
  energy_volume INTEGER DEFAULT 0,
  sync_modality INTEGER DEFAULT 0,
  hyperlucidity INTEGER DEFAULT 0,
  technique TEXT,
  sensations TEXT DEFAULT '[]',
  phenomena TEXT DEFAULT '[]',
  self_research_notes TEXT,
  linked_document_ids TEXT DEFAULT '[]',
  audio_url TEXT,
  audio_duration INTEGER DEFAULT 0,
  audio_notes TEXT,
  document_url TEXT,
  written_content TEXT,
  word_count INTEGER DEFAULT 0,
  transaction_value NUMERIC(12, 2) DEFAULT 0.00,
  transaction_type TEXT,
  financial_category_id TEXT,
  receipt_url TEXT,
  completed_at TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tarefas_meta ON tarefas(meta_id);

-- ==========================================
-- HABILITAR REALTIME (REPLICAÇÃO EM TEMPO REAL)
-- ==========================================
BEGIN;
  -- Remove as publicações antigas se existirem para evitar conflito
  drop publication if exists supabase_realtime;
  
  -- Cria publicação de tempo real para todas as tabelas do aplicativo
  create publication supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE diary_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE financial_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE financial_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE financial_projections;
ALTER PUBLICATION supabase_realtime ADD TABLE financial_mural;
ALTER PUBLICATION supabase_realtime ADD TABLE workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE folders;
ALTER PUBLICATION supabase_realtime ADD TABLE pages;
ALTER PUBLICATION supabase_realtime ADD TABLE objetivos;
ALTER PUBLICATION supabase_realtime ADD TABLE metas;
ALTER PUBLICATION supabase_realtime ADD TABLE tarefas;
