import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckSquare, 
  Clock, 
  Briefcase, 
  TrendingUp, 
  Target, 
  Calendar,
  ChevronRight,
  AlertCircle,
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  History,
  Zap,
  Loader2,
  Plus
} from 'lucide-react';
import { TaskItemInteractive } from './interactive/TaskItemInteractive';
import { ProjectCardInteractive } from './interactive/ProjectCardInteractive';
import { DashboardInteractive } from './interactive/DashboardInteractive';

interface DynamicRendererProps {
  type: string;
  data: any;
}

export const DynamicRenderer: React.FC<DynamicRendererProps> = ({ type, data }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  if (!data && !isLoading) return null;

  const content = data?._content;
  const suggestions = data?._suggestions || [];

  const renderLoading = () => (
    <div className="w-full space-y-4">
      <div className="h-8 w-64 bg-[#222] rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-[#111] border border-[#222] rounded-[20px] animate-pulse" />
        ))}
      </div>
    </div>
  );

  const renderView = () => {
    if (isLoading) return renderLoading();

    const Component = RENDER_MAP[type] || FallbackView;
    return <Component data={data} type={type} />;
  };

  return (
    <div className="w-full space-y-8 py-4">
      {/* 1. Título */}
      {content && (
        <motion.h1 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight"
        >
          {content}
        </motion.h1>
      )}

      {/* 2. Bloco Principal */}
      <div className="w-full">
        {renderView()}
      </div>

      {/* 4. Sugestões (Botões) */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4">
          {suggestions.map((suggestion: string, i: number) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02, backgroundColor: '#222' }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl bg-[#161616] border border-[#222] text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-2"
            >
              <Zap size={12} className="text-purple-500" />
              {suggestion}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- RENDER_MAP & Type-Driven Components ---

/**
 * Mapeamento central de tipos para componentes.
 * Facilita a expansão do sistema sem poluir o componente principal.
 */
const RENDER_MAP: Record<string, React.FC<{ data: any, type?: string }>> = {
  // Queries & Dashboards
  'query_summary': (props) => <DashboardInteractive {...props} onUpdate={() => {}} />,
  'dashboard': (props) => <DashboardInteractive {...props} onUpdate={() => {}} />,
  'query_projects': (props) => <ProjectsView {...props} />,
  
  // Lists & Tasks
  'query_tasks': (props) => <TasksView {...props} />,
  'list': (props) => <TasksView {...props} />,
  
  // Timeline
  'query_timeline': (props) => <TimelineView {...props} />,
  
  // Strategic / Cards
  'query_objective_progress': (props) => <ObjectiveProgressView {...props} />,
  'card': (props) => <ObjectiveProgressView {...props} />,

  // Basic Types
  'text': (props) => <TextView {...props} />,
  'task_create': (props) => <TaskCreateView {...props} />,
  'system': (props) => <SystemView {...props} />,
};

/**
 * Componente de Fallback para tipos desconhecidos.
 * Garante que a interface nunca quebre.
 */
const FallbackView: React.FC<{ type?: string }> = ({ type }) => (
  <div className="p-6 rounded-2xl bg-[#161616] border border-[#222] text-zinc-400 flex items-center gap-3">
    <AlertCircle size={20} className="text-amber-500" />
    <div className="flex flex-col">
      <span className="text-sm font-bold text-zinc-200">Componente não encontrado</span>
      <span className="text-xs text-zinc-500">O tipo "{type}" ainda não possui uma visualização mapeada.</span>
    </div>
  </div>
);

/**
 * Visualização de mensagens do sistema (confirmações).
 */
const SystemView: React.FC<{ data: any }> = ({ data }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3"
  >
    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
      <CheckSquare size={16} />
    </div>
    <span className="text-sm font-medium text-emerald-500/90">{data?.message || "Ação concluída com sucesso."}</span>
  </motion.div>
);

/**
 * Visualização básica de texto.
 */
const TextView: React.FC<{ data: any }> = ({ data }) => (
  <div className="prose prose-invert max-w-none">
    <p className="text-zinc-300 leading-relaxed">
      {data?.text || data?.content || "Nenhum conteúdo de texto disponível."}
    </p>
  </div>
);

/**
 * Visualização básica para criação de tarefas.
 */
const TaskCreateView: React.FC<{ data: any }> = ({ data }) => (
  <Card className="border-dashed border-zinc-700 bg-transparent hover:border-purple-500/50 transition-colors cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
        <Plus size={20} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-white">Criar Nova Tarefa</h4>
        <p className="text-xs text-zinc-500">{data?.title || "Defina os detalhes da sua próxima entrega"}</p>
      </div>
    </div>
  </Card>
);

// --- Shared Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-[#111] border border-[#222] rounded-[20px] p-5 md:p-6 shadow-2xl ${className}`}
  >
    {children}
  </motion.div>
);

const Badge = ({ children, color = "blue" }: { children: React.ReactNode, color?: string }) => {
  const colors: Record<string, string> = {
    green: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    yellow: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

// --- Dashboard View (query_summary) ---
const DashboardView = ({ data }: { data: any }) => {
  const stats = data.stats || [];
  const insights = data.insights || [];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <LayoutDashboard size={20} className="text-zinc-500" />
        <h2 className="text-lg font-semibold text-white">Resumo Executivo</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat: any, idx: number) => (
          <Card key={idx} className="flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</span>
              <div className={`p-2 rounded-lg ${
                stat.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                stat.status === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                stat.status === 'danger' ? 'bg-red-500/10 text-red-500' :
                'bg-blue-500/10 text-blue-500'
              }`}>
                {stat.label.toLowerCase().includes('tarefa') ? <CheckSquare size={16} /> : 
                 stat.label.toLowerCase().includes('projeto') ? <Briefcase size={16} /> : <TrendingUp size={16} />}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className={`text-[11px] font-medium ${
                stat.trend?.includes('+') ? 'text-emerald-500' : 
                stat.trend?.includes('-') ? 'text-red-500' : 'text-zinc-500'
              }`}>
                {stat.trend}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {insights.length > 0 && (
        <Card className="bg-gradient-to-br from-[#111] to-[#161616]">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-purple-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Insights da IA</span>
          </div>
          <ul className="space-y-3">
            {insights.map((insight: string, i: number) => (
              <li key={i} className="text-sm text-zinc-300 flex gap-3">
                <span className="text-purple-500 mt-1">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

// --- Projects View (query_projects) ---
const ProjectsView = ({ data }: { data: any }) => {
  const projects = data.projects || [];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <FolderKanban size={20} className="text-zinc-500" />
        <h2 className="text-lg font-semibold text-white">Projetos Ativos</h2>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {projects.map((project: any, idx: number) => (
          <motion.div
            key={idx}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <ProjectCardInteractive project={project} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// --- Tasks View (query_tasks) ---
const TasksView = ({ data }: { data: any }) => {
  const tasks = data.tasks || [];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <ListTodo size={20} className="text-zinc-500" />
        <h2 className="text-lg font-semibold text-white">Lista de Tarefas</h2>
      </div>

      <Card className="p-0 overflow-hidden">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
          className="divide-y divide-[#222]"
        >
          {tasks.map((task: any, idx: number) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, x: -10 },
                visible: { opacity: 1, x: 0 }
              }}
            >
              <TaskItemInteractive task={task} />
            </motion.div>
          ))}
          {tasks.length === 0 && (
            <div className="p-12 text-center text-zinc-500 text-sm italic">
              Nenhuma tarefa encontrada.
            </div>
          )}
        </motion.div>
      </Card>
    </div>
  );
};

// --- Timeline View (query_timeline) ---
const TimelineView = ({ data }: { data: any }) => {
  const events = data.events || [];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <History size={20} className="text-zinc-500" />
        <h2 className="text-lg font-semibold text-white">Linha do Tempo</h2>
      </div>

      <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#222]">
        {events.map((event: any, idx: number) => (
          <div key={idx} className="relative">
            <div className={`absolute -left-[31px] top-1 w-5 h-5 rounded-full border-4 border-[#0B0B0C] z-10 ${
              event.type === 'milestone' ? 'bg-purple-500' : 'bg-zinc-700'
            }`} />
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{event.date}</span>
              <Card className="p-4">
                <h4 className="text-sm font-bold text-white">{event.title}</h4>
                <p className="text-xs text-zinc-500 mt-1">{event.description}</p>
                {event.tags && (
                  <div className="flex gap-2 mt-3">
                    {event.tags.map((tag: string, i: number) => (
                      <span key={i} className="text-[9px] bg-[#222] text-zinc-400 px-2 py-0.5 rounded">#{tag}</span>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Objective Progress View (query_objective_progress) ---
const ObjectiveProgressView = ({ data }: { data: any }) => {
  const objective = data.objective || {};
  const kpis = data.kpis || [];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Target size={20} className="text-zinc-500" />
        <h2 className="text-lg font-semibold text-white">Objetivo Estratégico</h2>
      </div>

      <Card className="bg-gradient-to-br from-[#111] to-[#161616] border-purple-500/20">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1">
            <Badge color="purple">Estratégico</Badge>
            <h3 className="text-2xl font-bold text-white mt-3 mb-2">{objective.title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
              {objective.description}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center p-6 bg-purple-500/5 rounded-2xl border border-purple-500/10 min-w-[160px]">
            <div className="text-4xl font-black text-purple-500">{objective.progress}%</div>
            <div className="text-[10px] font-bold text-purple-500/60 uppercase tracking-widest mt-1">Concluído</div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="h-2 bg-[#222] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${objective.progress}%` }}
              className="h-full bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {kpis.map((kpi: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-[#161616] border border-[#222]">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{kpi.label}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-white">{kpi.value}</span>
                  <span className="text-[10px] text-zinc-500">/ {kpi.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

