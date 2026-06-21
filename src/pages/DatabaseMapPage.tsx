import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, Link2, Info, ArrowLeft, ArrowRight, Activity, 
  Sparkles, CheckCircle, HelpCircle, HardDrive, Server,
  User, Folder, FileText, Target, Calendar, CreditCard,
  Trophy, Key, Heart, MessageSquare, Menu, ShieldAlert
} from 'lucide-react';
import { haptics } from '../services/HapticService';

interface TableRelation {
  fromTable: string;
  toTable: string;
  fromColumn: string;
  toColumn: string;
  type: 'one-to-many' | 'one-to-one';
}

interface TableDefinition {
  id: string;
  name: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  origin: {
    page: string;
    action: string;
  };
  destination: string;
  consumption: string[];
  columns: {
    name: string;
    type: string;
    key?: 'PK' | 'FK';
    description: string;
  }[];
}

const tablesData: TableDefinition[] = [
  {
    id: 'profiles',
    name: 'profiles',
    label: 'Perfil do Usuário',
    description: 'Cadastro central do usuário autenticado no sistema.',
    icon: <User className="w-5 h-5" />,
    color: '#bae1ff', // Pastel Blue
    origin: { page: 'Boas-vindas / Login', action: 'Cadastro inicial de conta' },
    destination: 'Supabase Auth + Banco PostgreSQL',
    consumption: ['Sidebar', 'Amparo', 'Dashboard', 'Mural de Sucesso'],
    columns: [
      { name: 'id', type: 'uuid', key: 'PK', description: 'Identificador único (UUID) vindo do Auth.' },
      { name: 'email', type: 'text', description: 'E-mail cadastrado do usuário.' },
      { name: 'full_name', type: 'text', description: 'Nome completo do usuário.' },
      { name: 'avatar_url', type: 'text', description: 'Link da foto de perfil hospedada no storage da VPS.' },
      { name: 'created_at', type: 'timestamptz', description: 'Data de criação da conta.' }
    ]
  },
  {
    id: 'workspaces',
    name: 'workspaces',
    label: 'Workspaces (Áreas de Trabalho)',
    description: 'Coleção principal que agrupa pastas e arquivos do usuário.',
    icon: <HardDrive className="w-5 h-5" />,
    color: '#ffdac1', // Peach
    origin: { page: 'Gerenciador de Workspace', action: 'Criação de novos workspaces' },
    destination: 'Supabase Banco PostgreSQL',
    consumption: ['Gerenciador de Workspace', 'Editor de Documentos'],
    columns: [
      { name: 'id', type: 'uuid', key: 'PK', description: 'ID identificador único do workspace.' },
      { name: 'user_id', type: 'uuid', key: 'FK', description: 'Chave do perfil do usuário proprietário.' },
      { name: 'name', type: 'text', description: 'Nome descritivo da área de trabalho.' },
      { name: 'color', type: 'text', description: 'Cor em formato hexadecimal para estilização.' },
      { name: 'created_at', type: 'timestamptz', description: 'Data de criação do workspace.' }
    ]
  },
  {
    id: 'folders',
    name: 'folders',
    label: 'Pastas de Arquivos',
    description: 'Pastas organizacionais para separar notas e documentos.',
    icon: <Folder className="w-5 h-5" />,
    color: '#ffb7b2', // Coral/Red
    origin: { page: 'Gerenciador de Workspace', action: 'Criação de nova pasta dentro de um workspace' },
    destination: 'Supabase Banco PostgreSQL',
    consumption: ['Gerenciador de Workspace', 'Editor de Documentos'],
    columns: [
      { name: 'id', type: 'uuid', key: 'PK', description: 'ID identificador único da pasta.' },
      { name: 'workspace_id', type: 'uuid', key: 'FK', description: 'Workspace associado a esta pasta.' },
      { name: 'parent_id', type: 'uuid', key: 'FK', description: 'Pasta pai (caso seja uma subpasta).' },
      { name: 'name', type: 'text', description: 'Nome descritivo da pasta.' },
      { name: 'color', type: 'text', description: 'Hexadecimal da cor personalizada.' },
      { name: 'icon', type: 'text', description: 'Emoji ou código de ícone Lucide.' }
    ]
  },
  {
    id: 'documents',
    name: 'documents',
    label: 'Documentos (Conteúdos)',
    description: 'Páginas e anotações com formatação rich-text editadas pelo usuário.',
    icon: <FileText className="w-5 h-5" />,
    color: '#e2f0cb', // Soft Green
    origin: { page: 'Editor de Documentos', action: 'Digitação no editor TipTap' },
    destination: 'Supabase Banco PostgreSQL',
    consumption: ['Editor de Documentos', 'Gerenciador de Workspace'],
    columns: [
      { name: 'id', type: 'uuid', key: 'PK', description: 'ID identificador do documento.' },
      { name: 'user_id', type: 'uuid', key: 'FK', description: 'Usuário proprietário do arquivo.' },
      { name: 'workspace_id', type: 'uuid', key: 'FK', description: 'Workspace opcional onde reside.' },
      { name: 'folder_id', type: 'uuid', key: 'FK', description: 'Pasta opcional associada.' },
      { name: 'title', type: 'text', description: 'Título principal da nota.' },
      { name: 'content', type: 'text', description: 'Conteúdo em formato HTML/JSON.' },
      { name: 'cover_image', type: 'text', description: 'Capa decorativa (URL salva na VPS).' }
    ]
  },
  {
    id: 'objectives',
    name: 'objectives',
    label: 'Objetivos Evolutivos',
    description: 'Marcos existenciais de alta prioridade (Atacar Objetivos).',
    icon: <Target className="w-5 h-5" />,
    color: '#baffc9', // Mint
    origin: { page: 'Atacar Objetivos', action: 'Cadastro de novos objetivos estratégicos' },
    destination: 'Supabase Banco PostgreSQL',
    consumption: ['Atacar Objetivos', 'Dashboard da Vida'],
    columns: [
      { name: 'id', type: 'uuid', key: 'PK', description: 'ID do objetivo.' },
      { name: 'user_id', type: 'uuid', key: 'FK', description: 'Dono do objetivo existencial.' },
      { name: 'title', type: 'text', description: 'Título do objetivo.' },
      { name: 'description', type: 'text', description: 'Descrição das metas e sacrifícios.' },
      { name: 'progress', type: 'numeric', description: 'Percentual de avanço de metas.' }
    ]
  },
  {
    id: 'tasks',
    name: 'tasks',
    label: 'Tarefas e Lançamentos',
    description: 'Ações operacionais atreladas a objetivos de vida.',
    icon: <CheckCircle className="w-5 h-5" />,
    color: '#ffffba', // Light Yellow
    origin: { page: 'Atacar Objetivos', action: 'Adicionar nova tarefa em um projeto' },
    destination: 'Supabase Banco PostgreSQL',
    consumption: ['Atacar Objetivos', 'Amparo', 'Dashboard da Vida'],
    columns: [
      { name: 'id', type: 'uuid', key: 'PK', description: 'ID da tarefa.' },
      { name: 'user_id', type: 'uuid', key: 'FK', description: 'Dono da tarefa.' },
      { name: 'objective_id', type: 'uuid', key: 'FK', description: 'Objetivo associado.' },
      { name: 'title', type: 'text', description: 'Descrição textual da ação.' },
      { name: 'status', type: 'text', description: 'Status (todo ou completed).' },
      { name: 'execution_type', type: 'text', description: 'Tipo: padrão ou bioenergético (energy-work).' }
    ]
  },
  {
    id: 'energy_work_executions',
    name: 'energy_work_executions',
    label: 'Práticas Bioenergéticas',
    description: 'Dados técnicos de Estado Vibracional (EV) e fenômenos parapsíquicos.',
    icon: <Activity className="w-5 h-5" />,
    color: '#c3a1ff', // Lilac
    origin: { page: 'Amparo (Lab)', action: 'Registro por Sliders Rápidos de EV' },
    destination: 'Supabase Banco PostgreSQL',
    consumption: ['Amparo (Lab)', 'Dashboard da Vida'],
    columns: [
      { name: 'id', type: 'uuid', key: 'PK', description: 'ID da execução bioenergética.' },
      { name: 'task_id', type: 'uuid', key: 'FK', description: 'Tarefa associada a esta execução.' },
      { name: 'intensity', type: 'integer', description: 'Volume das energias (1 a 10).' },
      { name: 'symmetry', type: 'integer', description: 'Simetria e circulação energética (1 a 5).' },
      { name: 'lucidity', type: 'integer', description: 'Lucidez no experimento (1 a 5).' },
      { name: 'technique', type: 'text', description: 'Técnica utilizada (ex: ev, tenepes).' },
      { name: 'sensations', type: 'text[]', description: 'Lista de sensações sinalizadas.' },
      { name: 'phenomena', type: 'text[]', description: 'Lista de fenômenos registráveis.' }
    ]
  },
  {
    id: 'diary_entries',
    name: 'diary_entries',
    label: 'Diário de Bordo',
    description: 'Registros cronológicos cotidianos e autoavaliação holossomática.',
    icon: <Calendar className="w-5 h-5" />,
    color: '#d1f2eb', // Pastel Teal
    origin: { page: 'Diário / Novo Registro', action: 'Escrita diária com tags de energia' },
    destination: 'Supabase Banco PostgreSQL',
    consumption: ['Diário', 'Amparo', 'Dashboard da Vida'],
    columns: [
      { name: 'id', type: 'uuid', key: 'PK', description: 'ID do registro diário.' },
      { name: 'user_id', type: 'uuid', key: 'FK', description: 'Dono do diário.' },
      { name: 'title', type: 'text', description: 'Título do registro de bordo.' },
      { name: 'content', type: 'text', description: 'Conteúdo em formato HTML.' },
      { name: 'energy', type: 'text[]', description: 'Tags do energossoma selecionadas.' },
      { name: 'mental', type: 'text[]', description: 'Tags do mentalsoma selecionadas.' },
      { name: 'emotion', type: 'text[]', description: 'Tags do psicossoma selecionadas.' },
      { name: 'posture', type: 'text[]', description: 'Tags de postura consciencial.' },
      { name: 'vibe_rating', type: 'integer', description: 'Nota de vibe de 1 a 10.' }
    ]
  },
  {
    id: 'financial_categories',
    name: 'financial_categories',
    label: 'Categorias Financeiras',
    description: 'Definição de tetos e grupos de Dinheiro Proéxis.',
    icon: <CreditCard className="w-5 h-5" />,
    color: '#c1e1c1', // Mint Mist
    origin: { page: 'Dinheiro Proéxis', action: 'Cadastrar nova categoria orçamentária' },
    destination: 'Supabase Banco PostgreSQL',
    consumption: ['Dinheiro Proéxis', 'Dashboard da Vida'],
    columns: [
      { name: 'id', type: 'uuid', key: 'PK', description: 'ID da categoria.' },
      { name: 'user_id', type: 'uuid', key: 'FK', description: 'Dono da categoria.' },
      { name: 'name', type: 'text', description: 'Nome descritivo (ex: Alimentação).' },
      { name: 'type', type: 'text', description: 'Tipo: receita, despesa, investimento.' },
      { name: 'limit_amount', type: 'numeric', description: 'Teto mensal de gastos.' }
    ]
  },
  {
    id: 'financial_transactions',
    name: 'financial_transactions',
    label: 'Transações Financeiras',
    description: 'Lançamentos individuais de entradas, saídas e investimentos.',
    icon: <CreditCard className="w-5 h-5" />,
    color: '#bae1ff', // Pastel Blue
    origin: { page: 'Dinheiro Proéxis', action: 'Cadastrar receitas/despesas' },
    destination: 'Supabase Banco PostgreSQL',
    consumption: ['Dinheiro Proéxis', 'Dashboard da Vida'],
    columns: [
      { name: 'id', type: 'uuid', key: 'PK', description: 'ID do lançamento.' },
      { name: 'user_id', type: 'uuid', key: 'FK', description: 'Usuário proprietário.' },
      { name: 'category_id', type: 'uuid', key: 'FK', description: 'Categoria relacionada.' },
      { name: 'value', type: 'numeric', description: 'Valor em BRL do lançamento.' },
      { name: 'date', type: 'date', description: 'Data do evento financeiro.' }
    ]
  },
  {
    id: 'mural_achievements',
    name: 'mural_achievements',
    label: 'Conquistas (Mural)',
    description: 'Vitórias e marcos armazenados no cofre pessoal.',
    icon: <Trophy className="w-5 h-5" />,
    color: '#fdfd96', // Lemon Yellow
    origin: { page: 'Mural de Sucesso', action: 'Adicionar nova conquista com galeria' },
    destination: 'Supabase Banco PostgreSQL',
    consumption: ['Mural de Sucesso'],
    columns: [
      { name: 'id', type: 'uuid', key: 'PK', description: 'ID da conquista.' },
      { name: 'user_id', type: 'uuid', key: 'FK', description: 'Dono da conquista.' },
      { name: 'name', type: 'text', description: 'Nome do marco atingido.' },
      { name: 'value', type: 'numeric', description: 'Valor simbólico atribuído.' },
      { name: 'image', type: 'text', description: 'URL da capa hospedada na VPS Hostinger.' },
      { name: 'images', type: 'text[]', description: 'Lista de fotos anexas no storage da VPS.' }
    ]
  },
  {
    id: 'mural_credentials',
    name: 'mural_credentials',
    label: 'Documentos e Cofre',
    description: 'Arquivos protegidos e credenciais salvas no cofre.',
    icon: <Key className="w-5 h-5" />,
    color: '#cfd8dc', // Light Slate
    origin: { page: 'Mural de Sucesso', action: 'Registrar anexo PDF ou link no cofre' },
    destination: 'Supabase (metadados) + VPS Storage (arquivos físicos)',
    consumption: ['Mural de Sucesso'],
    columns: [
      { name: 'id', type: 'uuid', key: 'PK', description: 'ID da credencial.' },
      { name: 'achievement_id', type: 'uuid', key: 'FK', description: 'Conquista vinculada.' },
      { name: 'name', type: 'text', description: 'Nome descritivo da credencial.' },
      { name: 'url', type: 'text', description: 'URL do PDF estático salvo no disco da VPS.' },
      { name: 'fields', type: 'jsonb', description: 'Campos personalizados de texto salvos de forma protegida.' }
    ]
  },
  {
    id: 'presences',
    name: 'presences',
    label: 'Presenças e Contatos',
    description: 'Círculo de conexões e mentores para sintonia física.',
    icon: <Heart className="w-5 h-5" />,
    color: '#f3e5f5', // Lavender
    origin: { page: 'Presenças', action: 'Adicionar nova presença na rede' },
    destination: 'Supabase (metadados) + VPS Storage (fotos)',
    consumption: ['Presenças'],
    columns: [
      { name: 'id', type: 'uuid', key: 'PK', description: 'ID do contato.' },
      { name: 'user_id', type: 'uuid', key: 'FK', description: 'Dono do mapa de sintonia.' },
      { name: 'name', type: 'text', description: 'Nome da presença.' },
      { name: 'photo', type: 'text', description: 'Foto hospedada no storage da VPS.' },
      { name: 'intensity', type: 'integer', description: 'Nível de afinidade/sintonia (1 a 10).' }
    ]
  },
  {
    id: 'amparadora_conversations',
    name: 'amparadora_conversations',
    label: 'Chats Amparadora',
    description: 'Histórico de diálogos com a Inteligência Assistencial.',
    icon: <MessageSquare className="w-5 h-5" />,
    color: '#fdf2e9', // Linen/Sand
    origin: { page: 'Amparadora AI', action: 'Início de nova conversa estratégica' },
    destination: 'Supabase Banco PostgreSQL',
    consumption: ['Amparadora AI'],
    columns: [
      { name: 'id', type: 'uuid', key: 'PK', description: 'ID da conversa.' },
      { name: 'user_id', type: 'uuid', key: 'FK', description: 'Chave do usuário.' },
      { name: 'title', type: 'text', description: 'Título resumido do chat.' },
      { name: 'created_at', type: 'timestamptz', description: 'Data de início.' }
    ]
  },
  {
    id: 'amparadora_messages',
    name: 'amparadora_messages',
    label: 'Mensagens do Chat',
    description: 'Histórico de mensagens trocadas com a Amparadora.',
    icon: <MessageSquare className="w-5 h-5" />,
    color: '#fdf2e9', // Linen/Sand
    origin: { page: 'Amparadora AI', action: 'Envio de perguntas e respostas geradas' },
    destination: 'Supabase Banco PostgreSQL',
    consumption: ['Amparadora AI'],
    columns: [
      { name: 'id', type: 'uuid', key: 'PK', description: 'ID da mensagem.' },
      { name: 'conversation_id', type: 'uuid', key: 'FK', description: 'Conversa relacionada.' },
      { name: 'role', type: 'text', description: 'Remetente: user ou assistant.' },
      { name: 'content', type: 'text', description: 'Texto da mensagem.' },
      { name: 'file_url', type: 'text', description: 'URL de arquivo anexado salvo na VPS.' }
    ]
  }
];

const relationsData: TableRelation[] = [
  { fromTable: 'profiles', toTable: 'workspaces', fromColumn: 'id', toColumn: 'user_id', type: 'one-to-many' },
  { fromTable: 'profiles', toTable: 'documents', fromColumn: 'id', toColumn: 'user_id', type: 'one-to-many' },
  { fromTable: 'profiles', toTable: 'objectives', fromColumn: 'id', toColumn: 'user_id', type: 'one-to-many' },
  { fromTable: 'profiles', toTable: 'diary_entries', fromColumn: 'id', toColumn: 'user_id', type: 'one-to-many' },
  { fromTable: 'profiles', toTable: 'financial_categories', fromColumn: 'id', toColumn: 'user_id', type: 'one-to-many' },
  { fromTable: 'profiles', toTable: 'mural_achievements', fromColumn: 'id', toColumn: 'user_id', type: 'one-to-many' },
  { fromTable: 'profiles', toTable: 'presences', fromColumn: 'id', toColumn: 'user_id', type: 'one-to-many' },
  { fromTable: 'profiles', toTable: 'amparadora_conversations', fromColumn: 'id', toColumn: 'user_id', type: 'one-to-many' },
  { fromTable: 'workspaces', toTable: 'folders', fromColumn: 'id', toColumn: 'workspace_id', type: 'one-to-many' },
  { fromTable: 'folders', toTable: 'documents', fromColumn: 'id', toColumn: 'folder_id', type: 'one-to-many' },
  { fromTable: 'objectives', toTable: 'tasks', fromColumn: 'id', toColumn: 'objective_id', type: 'one-to-many' },
  { fromTable: 'tasks', toTable: 'energy_work_executions', fromColumn: 'id', toColumn: 'task_id', type: 'one-to-one' },
  { fromTable: 'financial_categories', toTable: 'financial_transactions', fromColumn: 'id', toColumn: 'category_id', type: 'one-to-many' },
  { fromTable: 'mural_achievements', toTable: 'mural_credentials', fromColumn: 'id', toColumn: 'achievement_id', type: 'one-to-many' },
  { fromTable: 'amparadora_conversations', toTable: 'amparadora_messages', fromColumn: 'id', toColumn: 'conversation_id', type: 'one-to-many' }
];

interface PageDefinition {
  id: string;
  name: string;
  label: string;
  status: 'connected' | 'partial' | 'mock';
  statusLabel: string;
  description: string;
  storageInfo: string;
  tables: string[];
  flow: {
    action: string;
    targetTable: string;
    description: string;
  }[];
}

const pagesData: PageDefinition[] = [
  {
    id: 'projects',
    name: 'projects',
    label: 'Atacar Objetivos',
    status: 'connected',
    statusLabel: '100% Conectado',
    description: 'Painel estratégico de objetivos evolutivos, metas e tarefas operacionais.',
    storageInfo: 'Supabase PostgreSQL (Tabelas: objectives, goals, projects, tasks)',
    tables: ['objectives', 'tasks'],
    flow: [
      { action: 'Criar Objetivo', targetTable: 'objectives', description: 'Grava metadados do alvo na tabela objectives.' },
      { action: 'Criar Meta', targetTable: 'objectives', description: 'Insere uma meta acoplada atualizando a coluna metas.' },
      { action: 'Criar/Atualizar Tarefa', targetTable: 'tasks', description: 'Insere/atualiza tarefa na tabela tasks, aplicando limpeza de chaves vazias.' }
    ]
  },
  {
    id: 'diary',
    name: 'diary',
    label: 'Diário de Bordo',
    status: 'connected',
    statusLabel: '100% Conectado',
    description: 'Diário de bordo cotidiano para autoavaliação holossomática e registros energéticos.',
    storageInfo: 'Supabase PostgreSQL (Tabela: diary_entries)',
    tables: ['diary_entries'],
    flow: [
      { action: 'Registrar Cotidiano', targetTable: 'diary_entries', description: 'Insere ou edita registros com pontuação de sintonia biológica.' }
    ]
  },
  {
    id: 'finances',
    name: 'finances',
    label: 'Dinheiro Proéxis (Finanças)',
    status: 'connected',
    statusLabel: '100% Conectado',
    description: 'Mapeamento de investimentos, teto de despesas e alavancagem profissional.',
    storageInfo: 'Supabase PostgreSQL (Tabelas: financial_categories, financial_transactions)',
    tables: ['financial_categories', 'financial_transactions'],
    flow: [
      { action: 'Nova Categoria', targetTable: 'financial_categories', description: 'Cria limites financeiros específicos.' },
      { action: 'Novo Lançamento', targetTable: 'financial_transactions', description: 'Associa custos operacionais a uma categoria no banco.' }
    ]
  },
  {
    id: 'presences',
    name: 'presences',
    label: 'Presenças',
    status: 'mock',
    statusLabel: 'Local / Em Memória',
    description: 'Mapa de sintonia mental e parapsíquica com mentores e referências humanas.',
    storageInfo: 'Memória Volátil do Navegador (Array localPresences - Redefine no reload)',
    tables: ['presences'],
    flow: [
      { action: 'Novo Mentor', targetTable: 'presences', description: 'Adiciona na lista local temporariamente, sem escrita no banco Supabase.' }
    ]
  },
  {
    id: 'mural',
    name: 'mural',
    label: 'Mural de Conquistas',
    status: 'partial',
    statusLabel: 'Conexão Parcial',
    description: 'Cofre de conquistas, registros de vitórias e upload físico de arquivos.',
    storageInfo: 'Supabase PostgreSQL (metadados) + VPS Storage Disk (arquivos físicos)',
    tables: ['mural_achievements', 'mural_credentials'],
    flow: [
      { action: 'Salvar Conquista', targetTable: 'mural_achievements', description: 'Grava título e valor no banco, e envia imagem de capa para a VPS.' },
      { action: 'Cofre e PDFs', targetTable: 'mural_credentials', description: 'Faz upload físico de arquivos e insere os links de acesso no banco.' }
    ]
  },
  {
    id: 'workspace',
    name: 'workspace',
    label: 'Gerenciador de Workspace',
    status: 'connected',
    statusLabel: '100% Conectado',
    description: 'Criação de pastas organizadas e notas rich-text escritas no editor.',
    storageInfo: 'Supabase PostgreSQL (Tabelas: workspaces, folders, pages)',
    tables: ['workspaces', 'folders', 'documents'],
    flow: [
      { action: 'Novo Workspace', targetTable: 'workspaces', description: 'Cria uma nova área de trabalho de anotação.' },
      { action: 'Criar Pasta', targetTable: 'folders', description: 'Cria pastas organizacionais aninhadas.' },
      { action: 'Escrever Documento', targetTable: 'documents', description: 'Salva anotações formatadas no banco.' }
    ]
  },
  {
    id: 'amparadora',
    name: 'amparadora',
    label: 'Amparadora AI',
    status: 'connected',
    statusLabel: '100% Conectado',
    description: 'Diálogos de mentoria, calibração consciencial e suporte cognitivo.',
    storageInfo: 'Supabase PostgreSQL (Tabelas: amparadora_conversations, amparadora_messages)',
    tables: ['amparadora_conversations', 'amparadora_messages'],
    flow: [
      { action: 'Criar Chat', targetTable: 'amparadora_conversations', description: 'Inicia nova conversa estruturada.' },
      { action: 'Enviar Mensagem', targetTable: 'amparadora_messages', description: 'Grava as mensagens do histórico da conversa.' }
    ]
  }
];

export function DatabaseMapPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'tables' | 'pages'>('tables');
  const [selectedTable, setSelectedTable] = useState<TableDefinition | null>(tablesData[0]);
  const [selectedPage, setSelectedPage] = useState<PageDefinition | null>(pagesData[0]);
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);

  // Calcula conexões ativas para destacar
  const getConnectedTableIds = (tableId: string) => {
    const ids = new Set<string>();
    relationsData.forEach(rel => {
      if (rel.fromTable === tableId) ids.add(rel.toTable);
      if (rel.toTable === tableId) ids.add(rel.fromTable);
    });
    return Array.from(ids);
  };

  const activeConnectedIds = selectedTable ? getConnectedTableIds(selectedTable.id) : [];

  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans antialiased text-[var(--text)] transition-colors duration-300">
      {/* Background visual decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full bg-cyan-500/[0.03]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full bg-violet-500/[0.03]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 flex flex-col h-full">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border)] mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                haptics.lightClick();
                navigate(-1);
              }}
              className="group flex items-center justify-center p-3 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] active:scale-95 transition-all text-[var(--text-secondary)] hover:text-[var(--text)]"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Database className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[var(--text-secondary)]">BANCO DE DADOS INTELIGENTE</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-none">
                Mapa de <span className="text-cyan-500">Circulação</span> de Dados
              </h1>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-1 rounded-2xl flex gap-1">
              <button
                onClick={() => {
                  haptics.lightClick();
                  setViewMode('tables');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${viewMode === 'tables' ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text)] border border-transparent'}`}
              >
                Por Tabelas
              </button>
              <button
                onClick={() => {
                  haptics.lightClick();
                  setViewMode('pages');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${viewMode === 'pages' ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text)] border border-transparent'}`}
              >
                Por Páginas (CRM)
              </button>
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 px-3 py-2 rounded-full flex items-center gap-1.5">
              <CheckCircle size={10} /> Real-Time Sync
            </span>
          </div>
        </header>

        {/* Info Box */}
        <section className="p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/15 mb-8 flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500 shrink-0">
            <Info size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[var(--text)]">
              {viewMode === 'tables' ? 'Jornada Interativa de Aprendizado' : 'Visão Geral por Página (CRM de Dados)'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-semibold leading-relaxed">
              {viewMode === 'tables' 
                ? 'Diferente de diagramas de banco de dados chatos e técnicos, este mapa mostra o fluxo da sua vida digital. Selecione uma tabela para ver onde as informações nascem, onde são armazenadas e em quais telas elas atualizam.'
                : 'Analise quais tabelas do banco de dados dão suporte a cada uma das telas do sistema. Veja com transparência quais recursos estão 100% integrados ao Supabase e quais estão temporariamente rodando apenas em memória.'}
            </p>
          </div>
        </section>

        {/* Main Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: List of Tables or Pages (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-6">
              
              {viewMode === 'tables' ? (
                <>
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Activity size={14} className="text-cyan-500 animate-pulse" /> Estrutura do Organismo (Tabelas)
                    </span>
                    <span className="text-[9px] uppercase font-mono text-[var(--text-secondary)]">Selecione para ver conexões</span>
                  </div>

                  {/* Flex list of Tables - Custom design */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {tablesData.map((table) => {
                      const isSelected = selectedTable?.id === table.id;
                      const isHovered = hoveredTableId === table.id;
                      const isConnected = selectedTable && activeConnectedIds.includes(table.id);
                      const isMainSelected = selectedTable?.id === table.id;

                      let borderStyle = 'border-[var(--border)] opacity-60';
                      let bgStyle = 'bg-[var(--bg)]/40';
                      let shadowStyle = '';

                      if (isMainSelected) {
                        borderStyle = 'border-cyan-500 ring-2 ring-cyan-500/10';
                        bgStyle = 'bg-cyan-500/5';
                        shadowStyle = 'shadow-lg';
                      } else if (isConnected) {
                        borderStyle = 'border-violet-500/60 border-dashed';
                        bgStyle = 'bg-violet-500/[0.02]';
                        shadowStyle = 'shadow-sm';
                      }

                      if (isHovered) {
                        borderStyle = 'border-cyan-400';
                      }

                      return (
                        <motion.div
                          layout
                          key={table.id}
                          onClick={() => {
                            haptics.lightClick();
                            setSelectedTable(table);
                          }}
                          onMouseEnter={() => setHoveredTableId(table.id)}
                          onMouseLeave={() => setHoveredTableId(null)}
                          className={`cursor-pointer p-4 rounded-3xl border ${borderStyle} ${bgStyle} ${shadowStyle} transition-all duration-300 hover:scale-102 flex items-center gap-3 relative`}
                        >
                          <div 
                            className="p-3 rounded-2xl shrink-0" 
                            style={{ backgroundColor: `${table.color}15`, color: table.color }}
                          >
                            {table.icon}
                          </div>
                          
                          <div className="min-w-0">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block truncate leading-none mb-1">
                              {table.name}
                            </span>
                            <h4 className="text-xs font-black text-[var(--text)] truncate leading-none">
                              {table.label}
                            </h4>
                          </div>

                          {isMainSelected && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500" />
                          )}
                          {isConnected && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-400/80" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Data Flow connections path */}
                  <div className="bg-[var(--bg)]/50 border border-[var(--border)] rounded-3xl p-5 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5 border-b border-[var(--border)] pb-2">
                      <Link2 size={12} className="text-cyan-400" /> Relações Ativas da Tabela Selecionada
                    </h4>
                    
                    {selectedTable ? (
                      <div className="space-y-3">
                        {relationsData
                          .filter(r => r.fromTable === selectedTable.id || r.toTable === selectedTable.id)
                          .map((rel, idx) => {
                            const isFrom = rel.fromTable === selectedTable.id;
                            const relatedId = isFrom ? rel.toTable : rel.fromTable;
                            const relatedTable = tablesData.find(t => t.id === relatedId);

                            return (
                              <div key={idx} className="flex items-center gap-3 text-xs bg-[var(--surface-hover)]/30 border border-[var(--border)]/35 p-3 rounded-2xl">
                                <span className="font-bold text-cyan-500">{selectedTable.label}</span>
                                <ArrowRight size={12} className="text-[var(--text-secondary)] opacity-50 shrink-0" />
                                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-[var(--border)] text-[var(--text-secondary)] font-mono">
                                  {rel.type === 'one-to-many' ? '1 ➔ N' : '1 ➔ 1'}
                                </span>
                                <ArrowRight size={12} className="text-[var(--text-secondary)] opacity-50 shrink-0" />
                                <span className="font-bold text-violet-500">{relatedTable?.label || relatedId}</span>
                                <span className="text-[10px] text-[var(--text-secondary)] ml-auto font-mono opacity-60">
                                  ({rel.fromColumn} ➔ {rel.toColumn})
                                </span>
                              </div>
                            );
                          })}
                        
                        {relationsData.filter(r => r.fromTable === selectedTable.id || r.toTable === selectedTable.id).length === 0 && (
                          <p className="text-[10px] text-[var(--text-secondary)] font-semibold">Esta tabela não possui chaves estrangeiras vinculadas.</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-secondary)] font-semibold">Selecione uma tabela acima para visualizar suas conexões lógicas.</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Server size={14} className="text-cyan-500" /> Auditoria de Integração por Páginas
                    </span>
                    <span className="text-[9px] uppercase font-mono text-[var(--text-secondary)]">Selecione a tela para mapear dados</span>
                  </div>

                  {/* List of Pages */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pagesData.map((page) => {
                      const isSelected = selectedPage?.id === page.id;
                      
                      let statusBorder = 'border-[var(--border)]';
                      let statusBg = 'bg-[var(--bg)]/40';
                      let statusBadge = '';
                      
                      if (page.status === 'connected') {
                        statusBadge = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                      } else if (page.status === 'partial') {
                        statusBadge = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                      } else {
                        statusBadge = 'bg-red-500/10 text-red-500 border-red-500/20';
                      }

                      if (isSelected) {
                        statusBorder = 'border-cyan-500 ring-2 ring-cyan-500/10';
                        statusBg = 'bg-cyan-500/5';
                      }

                      return (
                        <div
                          key={page.id}
                          onClick={() => {
                            haptics.lightClick();
                            setSelectedPage(page);
                          }}
                          className={`cursor-pointer p-5 rounded-3xl border ${statusBorder} ${statusBg} transition-all duration-300 hover:scale-102 flex flex-col justify-between h-44`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-black text-[var(--text)]">{page.label}</h4>
                              <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadge}`}>
                                {page.statusLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed line-clamp-2">
                              {page.description}
                            </p>
                          </div>

                          <div className="border-t border-[var(--border)]/60 pt-2 flex flex-wrap gap-1.5 mt-auto">
                            {page.tables.map(tName => {
                              const tbl = tablesData.find(t => t.name === tName);
                              return (
                                <span 
                                  key={tName} 
                                  className="text-[9px] font-semibold bg-[var(--surface-hover)] border border-[var(--border)] px-2 py-0.5 rounded-lg text-[var(--text-secondary)] flex items-center gap-1"
                                >
                                  <Database size={8} /> {tbl?.label || tName}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Right Column: Inspector Panel (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-6 md:p-8 shadow-sm flex flex-col relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
              
              {viewMode === 'tables' ? (
                <>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] mb-6 flex items-center gap-2 border-b border-[var(--border)] pb-2">
                    <Info size={14} className="text-cyan-500 animate-pulse" /> Fluxo Vital do Dado
                  </h3>

                  <AnimatePresence mode="wait">
                    {selectedTable ? (
                      <motion.div
                        key={selectedTable.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {/* Table Title */}
                        <div className="flex items-center gap-4">
                          <div 
                            className="p-4 rounded-2xl" 
                            style={{ backgroundColor: `${selectedTable.color}15`, color: selectedTable.color }}
                          >
                            {selectedTable.icon}
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-[var(--text)] tracking-tight leading-snug">
                              {selectedTable.label}
                            </h2>
                            <span className="text-[9px] font-mono text-[var(--text-secondary)] bg-[var(--surface-hover)] border border-[var(--border)] px-2.5 py-0.5 rounded-full mt-1 inline-block uppercase">
                              Tabela: {selectedTable.name}
                            </span>
                          </div>
                        </div>

                        {/* Table Description */}
                        <div>
                          <h4 className="text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1">O que armazena</h4>
                          <p className="text-xs text-[var(--text)] leading-relaxed font-semibold">
                            {selectedTable.description}
                          </p>
                        </div>

                        {/* Where it is born (Origin) */}
                        <div className="p-4 rounded-2xl bg-cyan-500/[0.03] border border-cyan-500/10">
                          <span className="text-[8px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded inline-block mb-2">
                            1. Onde nasce (Origem)
                          </span>
                          <p className="text-xs text-[var(--text)] font-bold">
                            Página: {selectedTable.origin.page}
                          </p>
                          <p className="text-[11px] text-[var(--text-secondary)] font-semibold mt-1">
                            Ação: {selectedTable.origin.action}
                          </p>
                        </div>

                        {/* Where it is saved (Destination) */}
                        <div className="p-4 rounded-2xl bg-violet-500/[0.03] border border-violet-500/10">
                          <span className="text-[8px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded inline-block mb-2">
                            2. Onde é gravado (Destino)
                          </span>
                          <p className="text-xs text-[var(--text)] font-semibold leading-relaxed">
                            {selectedTable.destination}
                          </p>
                        </div>

                        {/* Pages consuming it */}
                        <div className="p-4 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10">
                          <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded inline-block mb-2">
                            3. Onde é consumido (Uso)
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {selectedTable.consumption.map((page, idx) => (
                              <span 
                                key={idx} 
                                className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text)]"
                              >
                                {page}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Columns Inspector */}
                        <div className="border border-[var(--border)] rounded-3xl p-4 bg-[var(--surface-hover)]/30">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] mb-3 border-b border-[var(--border)] pb-2 flex items-center justify-between">
                            <span>Campos do Registro (Colunas)</span>
                            <span className="font-mono text-[9px] opacity-60">({selectedTable.columns.length})</span>
                          </h4>
                          
                          <div className="space-y-2.5 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
                            {selectedTable.columns.map((col, idx) => (
                              <div key={idx} className="text-[11px] leading-tight space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold font-mono text-[var(--text)]">{col.name}</span>
                                  <span className="text-[9px] font-mono text-[var(--text-secondary)] bg-[var(--border)] px-1.5 rounded">
                                    {col.type}
                                  </span>
                                  {col.key && (
                                    <span className={`text-[8px] font-mono px-1.5 rounded font-black uppercase ${col.key === 'PK' ? 'bg-amber-400/20 text-amber-500 border border-amber-400/30' : 'bg-violet-400/20 text-violet-500 border border-violet-400/30'}`}>
                                      {col.key}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-snug">
                                  {col.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="py-20 text-center opacity-50 flex flex-col items-center justify-center gap-3">
                        <Database size={32} className="text-[var(--text-secondary)] animate-bounce" />
                        <p className="text-xs text-[var(--text-secondary)] font-semibold">
                          Selecione uma tabela ao lado para inspecionar seu fluxo de circulação de dados.
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] mb-6 flex items-center gap-2 border-b border-[var(--border)] pb-2">
                    <Server size={14} className="text-cyan-500 animate-pulse" /> Detalhes da Página
                  </h3>

                  <AnimatePresence mode="wait">
                    {selectedPage ? (
                      <motion.div
                        key={selectedPage.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {/* Page Title */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h2 className="text-lg font-bold text-[var(--text)] tracking-tight leading-snug">
                              {selectedPage.label}
                            </h2>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${selectedPage.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : selectedPage.status === 'partial' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                              {selectedPage.statusLabel}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-[var(--text-secondary)] uppercase">
                            Identificador: {selectedPage.name}
                          </span>
                        </div>

                        {/* Storage details */}
                        <div className="p-4 rounded-2xl bg-cyan-500/[0.03] border border-cyan-500/10">
                          <span className="text-[8px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded inline-block mb-2">
                            Armazenamento Físico
                          </span>
                          <p className="text-xs text-[var(--text)] font-semibold leading-relaxed">
                            {selectedPage.storageInfo}
                          </p>
                        </div>

                        {/* CRM Flow actions */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border)] pb-2">
                            Ações de Entrada / Saída de Dados
                          </h4>
                          
                          <div className="space-y-3">
                            {selectedPage.flow.map((step, idx) => {
                              const tbl = tablesData.find(t => t.name === step.targetTable);
                              return (
                                <div key={idx} className="p-3 bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-cyan-500">{step.action}</span>
                                    <span 
                                      onClick={() => {
                                        if (tbl) {
                                          setViewMode('tables');
                                          setSelectedTable(tbl);
                                        }
                                      }}
                                      className="text-[9px] font-mono text-violet-400 hover:text-violet-300 underline cursor-pointer"
                                    >
                                      ➔ {tbl?.label || step.targetTable}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed">
                                    {step.description}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Interactive Tables link */}
                        <div className="space-y-2.5">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
                            Tabelas deste Módulo
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedPage.tables.map(tName => {
                              const tbl = tablesData.find(t => t.name === tName);
                              if (!tbl) return null;
                              return (
                                <button
                                  key={tName}
                                  onClick={() => {
                                    setViewMode('tables');
                                    setSelectedTable(tbl);
                                    haptics.lightClick();
                                  }}
                                  className="p-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-hover)] hover:bg-cyan-500/[0.03] hover:border-cyan-500/30 transition-all flex items-center justify-between text-left"
                                >
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="p-2 rounded-xl text-xs"
                                      style={{ backgroundColor: `${tbl.color}15`, color: tbl.color }}
                                    >
                                      {tbl.icon}
                                    </div>
                                    <div>
                                      <p className="text-xs font-black text-[var(--text)]">{tbl.label}</p>
                                      <p className="text-[9px] font-mono text-[var(--text-secondary)]">tabela: {tbl.name}</p>
                                    </div>
                                  </div>
                                  <ArrowRight size={14} className="text-[var(--text-secondary)] opacity-50" />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </motion.div>
                    ) : (
                      <div className="py-20 text-center opacity-50 flex flex-col items-center justify-center gap-3">
                        <Server size={32} className="text-[var(--text-secondary)] animate-bounce" />
                        <p className="text-xs text-[var(--text-secondary)] font-semibold">
                          Selecione uma página ao lado para inspecionar seus esquemas de banco de dados.
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
