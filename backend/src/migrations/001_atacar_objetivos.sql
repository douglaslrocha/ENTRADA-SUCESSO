-- Migration 001: Atacar Objetivos (Objetivos, Metas e Tarefas)

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
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_objetivos_user ON objetivos(user_id);

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
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_metas_objetivo ON metas(objetivo_id);

CREATE TABLE IF NOT EXISTS tarefas (
  -- 1. IDENTIDADE DA TAREFA
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  meta_id TEXT NOT NULL REFERENCES metas(id) ON DELETE CASCADE,
  parent_task_id TEXT REFERENCES tarefas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  execution_type TEXT NOT NULL DEFAULT 'standard',
  description TEXT,
  visual_anchor_url TEXT,
  status TEXT DEFAULT 'todo',
  
  -- 2. ESTRUTURA EXECUTÁVEL
  complexity TEXT DEFAULT 'low',
  subtasks TEXT DEFAULT '[]',

  -- 3. TEMPO E AGENDA
  scheduled_date TEXT,
  estimated_duration TEXT DEFAULT '',
  actual_duration INTEGER DEFAULT 0,
  is_recurring INTEGER DEFAULT 0,
  recurrence_pattern TEXT,
  recurrence_days TEXT DEFAULT '[]',
  parent_recurrence_id TEXT,

  -- 4. IMPACTO E PRIORIDADE
  priority TEXT DEFAULT 'medium',
  strategic_impact TEXT DEFAULT 'medium',

  -- 5. EXECUÇÃO PARAPSÍQUICA / BIOENERGÉTICA
  energy_volume INTEGER DEFAULT 0,
  sync_modality INTEGER DEFAULT 0,
  hyperlucidity INTEGER DEFAULT 0,
  technique TEXT,
  sensations TEXT DEFAULT '[]',
  phenomena TEXT DEFAULT '[]',
  self_research_notes TEXT,

  -- 6. VINCULAÇÃO DE NOTAS
  linked_document_ids TEXT DEFAULT '[]',

  -- 7. DETALHES MULTIMODAIS
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

  -- 8. CONTROLES DE SISTEMA
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tarefas_meta ON tarefas(meta_id);
