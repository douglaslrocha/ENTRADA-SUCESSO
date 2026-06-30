-- ==========================================
-- SCRIPT DE INICIALIZAÇÃO DO SUPABASE
-- Crie estas tabelas no Painel SQL do Supabase
-- ==========================================

-- ==========================================
-- MÓDULO: ATACAR OBJETIVOS & PODER PESSOAL (Manifesto de Identidade)
-- ==========================================

-- 1. MANIFESTO DE IDENTIDADE (RESPOSTAS EM COLUNAS FIXAS)
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
  
  -- Identidade Semanal (Segunda a Domingo)
  week_mon TEXT DEFAULT '',
  week_tue TEXT DEFAULT '',
  week_wed TEXT DEFAULT '',
  week_thu TEXT DEFAULT '',
  week_fri TEXT DEFAULT '',
  week_sat TEXT DEFAULT '',
  week_sun TEXT DEFAULT '',
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 2. MANIFESTO DE IDENTIDADE (MÍDIAS DE ANCORAGEM)
CREATE TABLE IF NOT EXISTS identity_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default',
  block_id TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'youtube')),
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. OBJETIVOS
CREATE TABLE IF NOT EXISTS objetivos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  title TEXT NOT NULL,
  burning_desire TEXT DEFAULT '',
  feelings TEXT DEFAULT '', -- Mapeado de 'feelings' no frontend
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'planning', -- Mapeado de 'status' (planning, active, paused, completed, canceled)
  sacrifice TEXT DEFAULT '',
  plan TEXT DEFAULT '', -- Mapeado de 'plan' no frontend
  start_date TEXT,
  deadline TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_interval TEXT, -- monthly, quarterly, yearly
  budget NUMERIC(12, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'BRL',
  media JSONB DEFAULT '[]', -- array: [{id, url, type, name, videoUrl}]
  kpis JSONB DEFAULT '[]', -- array: [{id, name, formaMedicao, pontoAtual, objetivoDesejado, ...}]
  archetype TEXT, -- mastery, habit, sprint, maintenance, discovery
  evolutionary_context TEXT DEFAULT '',
  risks JSONB DEFAULT '[]', -- array: [{id, description, probability, impact, mitigation}]
  related_objectives JSONB DEFAULT '[]', -- array of connected objective IDs
  tags JSONB DEFAULT '[]',
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
  description TEXT DEFAULT '',
  meaning TEXT NOT NULL DEFAULT '',
  evolutionary_context TEXT DEFAULT '',
  interpretacao TEXT DEFAULT 'linear',
  expected_evolution TEXT DEFAULT '',
  tipo_metrica TEXT DEFAULT 'unidade',
  forma_medicao TEXT DEFAULT '',
  ponto_atual TEXT DEFAULT '0',
  objetivo_desejado TEXT DEFAULT '',
  ritmo_esperado TEXT DEFAULT 'Constante',
  deadline TEXT,
  consequence TEXT DEFAULT '',
  risks TEXT DEFAULT '',
  impact_level TEXT DEFAULT 'medium',
  strategy TEXT DEFAULT '',
  actions JSONB DEFAULT '[]',
  color TEXT DEFAULT '#c3b1e1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_metas_objetivo ON metas(objetivo_id);

-- 5. TAREFAS
CREATE TABLE IF NOT EXISTS tarefas (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  meta_id TEXT REFERENCES metas(id) ON DELETE CASCADE, -- Nullable para suportar tarefas avulsas (sem meta/goalId = 'none')
  project_id TEXT, -- Suporte a vínculo direto com projetos
  objective_id TEXT, -- Vínculo facilitado com objetivo pai
  objective_title TEXT, -- Título do objetivo pai para exibições e listagens rápidas
  parent_task_id TEXT REFERENCES tarefas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  execution_type TEXT NOT NULL DEFAULT 'standard', -- standard, audio, written, financial, energy
  description TEXT DEFAULT '',
  visual_anchor_url TEXT,
  status TEXT DEFAULT 'todo', -- todo, doing, done, in-progress, completed, paused, blocked
  complexity TEXT DEFAULT 'low',
  subtasks JSONB DEFAULT '[]',
  checklist JSONB DEFAULT '[]',
  estimated_duration TEXT DEFAULT '',
  scheduled_date BIGINT, -- Timestamp em ms
  scheduled_time TEXT,
  date BIGINT, -- Data de criação/execução
  priority TEXT DEFAULT 'medium',
  strategic_impact TEXT DEFAULT 'medium',
  execution_strategy TEXT DEFAULT '',
  multimodal_config JSONB DEFAULT '{}', -- Configurações de leitura, foco, etc.
  actual_duration INTEGER DEFAULT 0,
  completed_at BIGINT, -- Timestamp de conclusão em ms
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Modalidade de Execução Bioenergética / Autopesquisa
  energy_volume INTEGER DEFAULT 0,
  sync_modality INTEGER DEFAULT 0,
  hyperlucidity INTEGER DEFAULT 0,
  technique TEXT DEFAULT '',
  sensations JSONB DEFAULT '[]', -- tags de sensações extraídas
  phenomena JSONB DEFAULT '[]', -- tags de fenômenos extraídos
  self_research_notes TEXT DEFAULT '',
  linked_document_ids JSONB DEFAULT '[]', -- documentos do Notion vinculados
  
  -- Modalidade de Execução por Áudio
  audio_url TEXT,
  audio_duration INTEGER DEFAULT 0,
  audio_notes TEXT,
  
  -- Modalidade de Execução por Escrita Livre / Leitura
  document_url TEXT,
  written_content TEXT,
  word_count INTEGER DEFAULT 0,
  
  -- Modalidade de Execução Financeira
  transaction_value NUMERIC(12, 2) DEFAULT 0.00,
  transaction_type TEXT, -- income ou expense
  financial_category_id TEXT,
  receipt_url TEXT,
  
  -- Recorrência Avançada
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT DEFAULT 'none', -- daily, weekly, monthly
  recurrence_days JSONB DEFAULT '[]', -- dias da semana selecionados (ex: ["seg", "ter"])
  parent_recurrence_id TEXT -- Vincula a tarefa original recorrente
);
CREATE INDEX IF NOT EXISTS idx_tarefas_meta ON tarefas(meta_id);


-- ==========================================
-- MÓDULO: DIÁRIO DE BORDO
-- ==========================================

-- 6. DIÁRIO DE BORDO
CREATE TABLE IF NOT EXISTS diary_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  status TEXT DEFAULT 'active', -- active or completed
  location TEXT DEFAULT '',
  
  -- Calendário e Duração
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  duration INTEGER DEFAULT 0,
  "time" TEXT, -- horário de início (string formato HH:MM)
  day TEXT,
  month TEXT,
  month_name TEXT,
  year TEXT,
  weekday TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Clima e Frequência do Dia
  title TEXT NOT NULL DEFAULT 'Novo Diário',
  description TEXT DEFAULT '',
  temp TEXT DEFAULT '',
  waves TEXT DEFAULT '',
  rating TEXT DEFAULT '', -- humor/nota do dia (1 a 5 estrelas)
  
  -- Imagens e Ícone de Ancoragem (Estilo Notion / Capa & Emoji)
  cover_image TEXT,
  cover_position NUMERIC DEFAULT 50.00,
  doc_icon TEXT, -- emoji ou ícone selecionado pelo usuário
  main_image TEXT, -- primeira imagem encontrada no editor (carregada para o card)
  event_image TEXT, -- segunda imagem encontrada no editor
  circle_image TEXT, -- terceira imagem encontrada no editor
  event_title TEXT DEFAULT '',
  event_date TEXT DEFAULT '',
  
  -- Conteúdo Livre (HTML do editor Tiptap contendo imagens, marca-texto e carrosséis)
  content TEXT DEFAULT '', -- Conteúdo principal / Sonhos
  news_content TEXT DEFAULT '', -- Novidades do dia (não planejadas)
  insights_content TEXT DEFAULT '', -- Insights
  free_content TEXT DEFAULT '', -- Escrita livre
  consolidation_content TEXT DEFAULT '', -- Consolidação de aprendizados
  guidance_content TEXT DEFAULT '', -- Direcionamento da amparadora
  analise_ia TEXT DEFAULT '', -- Resumo profundo gerado pela IA Amparadora no encerramento

  -- Estruturas Semânticas / Listas Auxiliares (JSONB)
  day_opening JSONB DEFAULT '{}', -- Abertura do dia estruturada
  dreams JSONB DEFAULT '[]', -- sonhos extraídos
  actions JSONB DEFAULT '[]', -- ações do dia
  habits JSONB DEFAULT '[]', -- hábitos rastreados
  insights JSONB DEFAULT '[]', -- insights extraídos
  state JSONB DEFAULT '{}', -- estado corporal
  guidance JSONB DEFAULT '{}', -- orientações de mentores
  day_synthesis JSONB DEFAULT '{}', -- síntese do dia
  semantic_entities JSONB DEFAULT '{}', -- entidades semânticas extraídas (pessoas, lugares, símbolos)
  blocks JSONB DEFAULT '[]', -- blocos do Notion
  essential_actions JSONB DEFAULT '[]', -- ações essenciais de hoje
  recurring_actions JSONB DEFAULT '[]', -- ações recorrentes
  tomorrow_actions JSONB DEFAULT '[]', -- ações planejadas para amanhã
  categories JSONB DEFAULT '[]', -- categorias/tags do diário
  gallery JSONB DEFAULT '[]', -- lista de imagens da galeria (carrosséis)
  
  -- Vetores de Sincronia Consciencial (JSONB arrays de tags)
  posture JSONB DEFAULT '[]',
  mental JSONB DEFAULT '[]',
  emotion JSONB DEFAULT '[]',
  energy JSONB DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_diary_entries_user ON diary_entries(user_id);


-- ==========================================
-- MÓDULO: FINANÇAS / CORTES
-- ==========================================

-- 7. CATEGORIAS FINANCEIRAS
CREATE TABLE IF NOT EXISTS financial_categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- 8. TRANSAÇÕES FINANCEIRAS
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

-- 9. PROJEÇÕES FINANCEIRAS
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

-- 10. MURAL FINANCEIRO
CREATE TABLE IF NOT EXISTS financial_mural (
  user_id TEXT PRIMARY KEY DEFAULT 'default',
  net_worth TEXT DEFAULT '{"current_cash": 0.00}',
  assets TEXT DEFAULT '[]',
  vault TEXT DEFAULT '[]',
  links TEXT DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- MÓDULO: WORKSPACES & DOCUMENTOS
-- ==========================================

-- 11. WORKSPACES
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  color TEXT DEFAULT '#000000',
  icon TEXT DEFAULT '📄',
  icon_type TEXT DEFAULT 'emoji',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. PASTAS (FOLDERS)
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  color TEXT DEFAULT '#000000',
  icon TEXT DEFAULT '📄',
  icon_type TEXT DEFAULT 'emoji',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. PÁGINAS (DOCUMENTS)
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  is_pinned BOOLEAN DEFAULT FALSE,
  cover_image TEXT,
  cover_position NUMERIC DEFAULT 50.00,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 14. CATÁLOGOS DE BIOENERGIAS (AMPARO / FATUÍSTICA)
CREATE TABLE IF NOT EXISTS energy_work_catalogs (
  user_id TEXT NOT NULL DEFAULT 'default',
  catalog_type TEXT NOT NULL CHECK (catalog_type IN ('sensations', 'phenomena', 'fatuistica')),
  items JSONB DEFAULT '[]', -- Lista de itens do catálogo (tags)
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, catalog_type)
);

-- 15. HISTÓRICO DE CHATS DA AMPARADORA AI
CREATE TABLE IF NOT EXISTS amparadora_chats (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  title TEXT NOT NULL,
  messages JSONB DEFAULT '[]', -- array of MemoryEntry
  last_update TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 16. BACKGROUNDS PERSONALIZADOS
CREATE TABLE IF NOT EXISTS experience_backgrounds (
  user_id TEXT PRIMARY KEY DEFAULT 'default',
  amparadora JSONB DEFAULT '[]',
  dashboard JSONB DEFAULT '[]',
  diary JSONB DEFAULT '[]',
  finance JSONB DEFAULT '[]',
  objectives JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


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
  references JSONB DEFAULT '[]',
  
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
-- HABILITAR REALTIME (REPLICAÇÃO EM TEMPO REAL)
-- ==========================================
BEGIN;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE identity_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE identity_media;
ALTER PUBLICATION supabase_realtime ADD TABLE objetivos;
ALTER PUBLICATION supabase_realtime ADD TABLE metas;
ALTER PUBLICATION supabase_realtime ADD TABLE tarefas;
ALTER PUBLICATION supabase_realtime ADD TABLE diary_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE financial_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE financial_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE financial_projections;
ALTER PUBLICATION supabase_realtime ADD TABLE financial_mural;
ALTER PUBLICATION supabase_realtime ADD TABLE workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE folders;
ALTER PUBLICATION supabase_realtime ADD TABLE pages;
ALTER PUBLICATION supabase_realtime ADD TABLE energy_work_catalogs;
ALTER PUBLICATION supabase_realtime ADD TABLE amparadora_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE experience_backgrounds;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_cognitive_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE presences;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profile;



