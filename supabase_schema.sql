-- ==========================================
-- SCRIPT DE INICIALIZAÇÃO DO SUPABASE
-- Crie estas tabelas no Painel SQL do Supabase
-- ==========================================

-- ==========================================
-- PASSO 1: APAGAR TODAS AS TABELAS ANTIGAS E COLUNAS CONFLITANTES (LIMPEZA TOTAL)
-- ==========================================
DROP TABLE IF EXISTS _migrations CASCADE;
DROP TABLE IF EXISTS identity_answers CASCADE;
DROP TABLE IF EXISTS identity_media CASCADE;
DROP TABLE IF EXISTS objetivos CASCADE;
DROP TABLE IF EXISTS metas CASCADE;
DROP TABLE IF EXISTS tarefas CASCADE;
DROP TABLE IF EXISTS diary_entries CASCADE;
DROP TABLE IF EXISTS financial_categories CASCADE;
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS financial_projections CASCADE;
DROP TABLE IF EXISTS financial_mural CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS folders CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS energy_work_catalogs CASCADE;
DROP TABLE IF EXISTS amparadora_chats CASCADE;
DROP TABLE IF EXISTS experience_backgrounds CASCADE;
DROP TABLE IF EXISTS ai_cognitive_settings CASCADE;
DROP TABLE IF EXISTS presences CASCADE;
DROP TABLE IF EXISTS user_profile CASCADE;

-- ==========================================
-- PASSO 2: CRIAR A NOVA ESTRUTURA COMPLETA E CORRETA DO APP
-- ==========================================

-- 1. RESPOSTAS DE IDENTIDADE (IDENTITY ANSWERS)
CREATE TABLE IF NOT EXISTS identity_answers (
  user_id TEXT PRIMARY KEY DEFAULT 'default',
  
  -- Identidade Profissional
  prof_1 TEXT DEFAULT '',
  prof_2 TEXT DEFAULT '',
  prof_3 TEXT DEFAULT '',
  prof_4 TEXT DEFAULT '',
  
  -- Identidade Financeira
  fin_1 TEXT DEFAULT '',
  fin_2 TEXT DEFAULT '',
  fin_3 TEXT DEFAULT '',
  fin_4 TEXT DEFAULT '',
  
  -- Identidade Emocional
  emo_1 TEXT DEFAULT '',
  emo_2 TEXT DEFAULT '',
  emo_3 TEXT DEFAULT '',
  emo_4 TEXT DEFAULT '',
  
  -- Relacionamentos
  rel_1 TEXT DEFAULT '',
  rel_2 TEXT DEFAULT '',
  rel_3 TEXT DEFAULT '',
  rel_4 TEXT DEFAULT '',
  
  -- Disciplina e Execução
  disc_1 TEXT DEFAULT '',
  disc_2 TEXT DEFAULT '',
  disc_3 TEXT DEFAULT '',
  disc_4 TEXT DEFAULT '',
  
  -- Identidade Futura
  fut_1 TEXT DEFAULT '',
  fut_2 TEXT DEFAULT '',
  fut_3 TEXT DEFAULT '',
  fut_4 TEXT DEFAULT '',
  
  -- Identidade Semanal (Segunda)
  weekly_monday_1 TEXT DEFAULT '',
  weekly_monday_2 TEXT DEFAULT '',
  weekly_monday_3 TEXT DEFAULT '',
  weekly_monday_4 TEXT DEFAULT '',
  
  -- Identidade Semanal (Domingo)
  weekly_sunday_1 TEXT DEFAULT '',
  weekly_sunday_2 TEXT DEFAULT '',
  weekly_sunday_3 TEXT DEFAULT '',
  weekly_sunday_4 TEXT DEFAULT '',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. MÍDIAS DE IDENTIDADE (IDENTITY MEDIA)
CREATE TABLE IF NOT EXISTS identity_media (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  block_id TEXT NOT NULL,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_identity_media_user ON identity_media(user_id);

-- 3. OBJETIVOS
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

-- 4. METAS
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

-- 5. TAREFAS
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tarefas_meta ON tarefas(meta_id);

-- 6. DIÁRIO (DIARY ENTRIES)
CREATE TABLE IF NOT EXISTS diary_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT NOT NULL,
  date TEXT NOT NULL,
  images TEXT DEFAULT '[]',
  audio_url TEXT,
  audio_duration INTEGER DEFAULT 0,
  audio_notes TEXT,
  sensations TEXT DEFAULT '[]',
  energy_level INTEGER DEFAULT 5,
  cognitive_insights TEXT DEFAULT '[]',
  parapsychic_clues TEXT DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_diary_entries_user ON diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON diary_entries(date);

-- 7. CATEGORIAS FINANCEIRAS (FINANCIAL CATEGORIES)
CREATE TABLE IF NOT EXISTS financial_categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_financial_categories_user ON financial_categories(user_id);

-- 8. TRANSAÇÕES FINANCEIRAS (FINANCIAL TRANSACTIONS)
CREATE TABLE IF NOT EXISTS financial_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  value NUMERIC(12, 2) NOT NULL,
  category_id TEXT NOT NULL REFERENCES financial_categories(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user ON financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON financial_transactions(category_id);

-- 9. PROJEÇÕES FINANCEIRAS (FINANCIAL PROJECTIONS)
CREATE TABLE IF NOT EXISTS financial_projections (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  category_id TEXT NOT NULL REFERENCES financial_categories(id) ON DELETE CASCADE,
  allowed_value NUMERIC(12, 2) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_projection_month_year UNIQUE (user_id, category_id, month, year)
);
CREATE INDEX IF NOT EXISTS idx_financial_projections_user ON financial_projections(user_id);

-- 10. MURAL FINANCEIRO (FINANCIAL MURAL)
CREATE TABLE IF NOT EXISTS financial_mural (
  user_id TEXT PRIMARY KEY DEFAULT 'default',
  net_worth JSONB NOT NULL DEFAULT '{"current_cash": 0.00}',
  assets JSONB NOT NULL DEFAULT '[]',
  vault JSONB NOT NULL DEFAULT '[]',
  links JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. WORKSPACES
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT NOT NULL DEFAULT 'folder',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_workspaces_user ON workspaces(user_id);

-- 12. PASTAS (FOLDERS)
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_folders_workspace ON folders(workspace_id);

-- 13. PÁGINAS (PAGES)
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  folder_id TEXT REFERENCES folders(id) ON DELETE CASCADE,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  emoji TEXT DEFAULT '📄',
  cover_url TEXT,
  marker_color TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pages_folder ON pages(folder_id);
CREATE INDEX IF NOT EXISTS idx_pages_workspace ON pages(workspace_id);

-- 14. CATÁLOGO DE TRABALHOS ENERGÉTICOS (ENERGY WORK CATALOGS)
CREATE TABLE IF NOT EXISTS energy_work_catalogs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'technique',
  category TEXT NOT NULL DEFAULT 'basic',
  description TEXT DEFAULT '',
  steps JSONB DEFAULT '[]',
  estimated_duration INTEGER DEFAULT 10,
  difficulty TEXT DEFAULT 'beginner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_energy_work_catalogs_user ON energy_work_catalogs(user_id);

-- 15. CHATS DA AMPARADORA (AMPARADORA CHATS)
CREATE TABLE IF NOT EXISTS amparadora_chats (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  title TEXT NOT NULL DEFAULT 'Nova Conversa',
  messages JSONB DEFAULT '[]',
  summary TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_amparadora_chats_user ON amparadora_chats(user_id);

-- 16. BACKGROUNDS PERSONALIZADOS DE PÁGINAS (EXPERIENCE BACKGROUNDS)
CREATE TABLE IF NOT EXISTS experience_backgrounds (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  page_name TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_page_background UNIQUE (user_id, page_name)
);
CREATE INDEX IF NOT EXISTS idx_experience_backgrounds_user ON experience_backgrounds(user_id);

-- 17. CONFIGURAÇÕES COGNITIVAS DA IA
CREATE TABLE IF NOT EXISTS ai_cognitive_settings (
  user_id TEXT PRIMARY KEY DEFAULT 'default',
  global_personality TEXT DEFAULT 'Você é a Amparadora de Próxima Geração. Deve agir com extrema empatia, pragmatismo analítico e inteligência holística. Seu rumo de conversa deve ser focado em apoiar minhas tomadas de decisão de forma lúcida, equilibrada e focada no auto-aperfeiçoamento quotidiano. Evite respostas genéricas e traga uma visão madura baseada em lógica.',
  temperature NUMERIC(3,2) DEFAULT 0.70,
  selected_model TEXT DEFAULT 'gpt-4o-mini',
  knowledge_constraint TEXT DEFAULT 'flexible',
  knowledge_docs TEXT DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 18. ECOSSISTEMA DE PRESENÇAS (HUMANIDADE)
CREATE TABLE IF NOT EXISTS presences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  photo TEXT NOT NULL,
  city TEXT DEFAULT '',
  country TEXT DEFAULT '',
  age TEXT DEFAULT '',
  profession TEXT DEFAULT '',
  visited_countries TEXT DEFAULT '',
  
  -- Campos de Influência Existencial
  influencia TEXT DEFAULT '',
  acionar_quando TEXT DEFAULT '',
  dna TEXT DEFAULT '',
  impacto TEXT DEFAULT '',
  alerta TEXT DEFAULT '',
  peso NUMERIC(4,2) DEFAULT 0.00,
  
  -- Coleções complexas em formato JSONB
  secondary_images JSONB DEFAULT '[]',
  main_videos JSONB DEFAULT '[]',
  companies JSONB DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  connections JSONB DEFAULT '[]',
  essentials JSONB DEFAULT '{}',
  characteristics JSONB DEFAULT '[]',
  quotes JSONB DEFAULT '[]',
  sensations JSONB DEFAULT '[]',
  human_notes JSONB DEFAULT '{}',
  living_gallery JSONB DEFAULT '[]',
  living_content JSONB DEFAULT '[]',
  associated_references JSONB DEFAULT '[]',
  
  -- Campos livres e legados
  free_notes TEXT DEFAULT '',
  role TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  images JSONB DEFAULT '[]',
  thoughts JSONB DEFAULT '[]',
  "references" JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_presences_user ON presences(user_id);

-- 19. CONFIGURAÇÃO DE PERFIL E MARCA PERSONALIZADA (SHELL INTERFACE)
CREATE TABLE IF NOT EXISTS user_profile (
  user_id TEXT PRIMARY KEY DEFAULT 'default',
  
  -- Perfil do Usuário
  name TEXT DEFAULT 'Usuário',
  age TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  city TEXT DEFAULT '',
  ip TEXT DEFAULT '',
  last_known_location JSONB DEFAULT 'null',
  
  -- Customização da Marca / Shell Interface
  app_custom_name TEXT DEFAULT 'Remix 1.7',
  app_custom_description TEXT DEFAULT 'Evolução Pessoal',
  app_custom_icon_type TEXT DEFAULT 'default',
  app_custom_icon_value TEXT DEFAULT '/pwa-icon.svg',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_profile_user ON user_profile(user_id);


-- ==========================================
-- DESATIVAR RLS EM TODAS AS TABELAS (ACESSO PÚBLICO COM ANON KEY)
-- ==========================================
ALTER TABLE identity_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE identity_media DISABLE ROW LEVEL SECURITY;
ALTER TABLE objetivos DISABLE ROW LEVEL SECURITY;
ALTER TABLE metas DISABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas DISABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_projections DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_mural DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE energy_work_catalogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE amparadora_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE experience_backgrounds DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cognitive_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE presences DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile DISABLE ROW LEVEL SECURITY;

-- Garantir permissões completas para anon e authenticated
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

