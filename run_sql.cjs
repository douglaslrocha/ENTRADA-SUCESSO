const { Client } = require('pg');

const connectionString = 'postgresql://postgres:ptUtQmv787k3fXI4uCW3rjOybzR9lJrM@187.127.3.42:5432/postgres?sslmode=disable';

const sql = `
-- 1. TABELA DE OBJETIVOS
CREATE TABLE IF NOT EXISTS objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  burning_desire TEXT NOT NULL,
  feeling_of_achievement TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  manifestation_status TEXT NOT NULL DEFAULT 'conception',
  sacrifice TEXT NOT NULL,
  action_plan TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deadline TIMESTAMPTZ NOT NULL,
  mental_recurrence BOOLEAN DEFAULT FALSE,
  manifestation_images TEXT[] DEFAULT '{}',
  motivational_videos TEXT[] DEFAULT '{}',
  evolutionary_context TEXT NOT NULL,
  risks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE METAS (Forte ligação com Objetivos)
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  intention TEXT NOT NULL,
  description TEXT,
  meaning TEXT NOT NULL,
  expected_evolution TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  consequence TEXT NOT NULL,
  risks TEXT NOT NULL,
  impact_level TEXT NOT NULL DEFAULT 'medium',
  strategy TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#c3b1e1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE TAREFAS (Forte ligação com Metas)
CREATE TABLE IF NOT EXISTS tasks (
  -- Identidade da Tarefa
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  execution_type TEXT NOT NULL DEFAULT 'standard',
  description TEXT,
  visual_anchor_url TEXT,
  status TEXT DEFAULT 'todo',
  
  -- Estrutura Executável
  complexity TEXT DEFAULT 'low',
  subtasks JSONB DEFAULT '[]'::jsonb,

  -- Tempo e Agenda
  scheduled_date TIMESTAMPTZ,
  estimated_duration TEXT DEFAULT '',
  actual_duration INTEGER DEFAULT 0,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT,
  recurrence_days TEXT[] DEFAULT '{}',
  parent_recurrence_id UUID,

  -- Impacto e Prioridade
  priority TEXT DEFAULT 'medium',
  strategic_impact TEXT DEFAULT 'medium',

  -- Execução Parapsíquica / Bioenergética ('energy-work')
  energy_volume INTEGER DEFAULT 0,
  sync_modality INTEGER DEFAULT 0,
  hyperlucidity INTEGER DEFAULT 0,
  technique TEXT,
  sensations TEXT[] DEFAULT '{}',
  phenomena TEXT[] DEFAULT '{}',
  self_research_notes TEXT,

  -- Vinculação de Notas
  linked_document_ids UUID[] DEFAULT '{}',

  -- Detalhes Multimodais (Áudio, PDF e Finanças)
  audio_url TEXT,
  audio_duration INTEGER DEFAULT 0,
  audio_notes TEXT,
  
  document_url TEXT,
  written_content TEXT,
  word_count INTEGER DEFAULT 0,

  transaction_value NUMERIC(12, 2) DEFAULT 0.00,
  transaction_type TEXT,
  financial_category_id UUID,
  receipt_url TEXT,

  -- Controles de Sistema
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

async function run() {
  const client = new Client({ connectionString });
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Running SQL statements to create tables...');
    await client.query(sql);
    console.log('Tables created successfully!');
    
    // Verify tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('Tables present in database:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('SQL Execution Error:', err);
  } finally {
    await client.end();
  }
}
run();
