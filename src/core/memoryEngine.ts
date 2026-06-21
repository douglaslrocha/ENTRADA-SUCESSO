import { memoryStore, MemoryData } from './memoryStore';
import { UserProfile } from './userProfile';

/**
 * Motor de Memória de Longo Prazo.
 * Aprende com o comportamento do usuário e identifica padrões.
 */
export const memoryEngine = {
  /**
   * Registra uma interação bem-sucedida para aprendizado futuro.
   */
  registerInteraction(aiResponse: any, userInput: string) {
    const { intent, entities } = aiResponse;
    const memory = memoryStore.getMemory();
    
    console.log(`[MemoryEngine] Registrando interação: ${intent}`);

    // 1. Atualizar histórico (limitado aos últimos 50 eventos relevantes)
    const interaction = {
      intent,
      entities,
      userInput,
      timestamp: new Date().toISOString()
    };
    memory.history = [interaction, ...memory.history].slice(0, 50);

    // 2. Atualizar estatísticas de uso
    const stats = memory.userProfile.usageStats || {};
    stats[intent] = (stats[intent] || 0) + 1;
    memory.userProfile.usageStats = stats;

    // 3. Detectar padrões simples
    this.updatePatterns(memory, interaction);

    // 4. Salvar memória atualizada
    memoryStore.saveMemory(memory);
  },

  /**
   * Identifica repetições e atualiza o perfil do usuário.
   */
  updatePatterns(memory: MemoryData, interaction: any) {
    const { intent, entities } = interaction;
    const profile = memory.userProfile;

    // Exemplo: Se criar muitas tarefas com a mesma entidade (ex: "roteiro")
    if (intent === 'create_task' && entities.title) {
      const title = entities.title.toLowerCase();
      if (title.includes('roteiro') || title.includes('youtube')) {
        this.addToFrequent(profile.frequentActions, 'Criação de roteiros/conteúdo');
      }
    }

    // Exemplo: Se usar muito um projeto específico
    if (entities.project_name) {
      this.addToFrequent(profile.frequentProjects, entities.project_name);
    }

    // Exemplo: Se usar muito um tipo específico de transação
    if (intent === 'financial_entry' && entities.category) {
      this.addToFrequent(profile.preferredTypes, entities.category);
    }
  },

  /**
   * Adiciona um item a uma lista de frequência se ele se repetir.
   */
  addToFrequent(list: string[], item: string) {
    if (!list.includes(item)) {
      list.push(item);
    }
    // Manter apenas os top 5 mais frequentes
    if (list.length > 5) list.shift();
  },

  /**
   * Registra padrões baseados em eventos do sistema.
   */
  recordEventPattern(event: string, data: any) {
    const memory = memoryStore.getMemory();
    const profile = memory.userProfile;

    console.log(`[MemoryEngine] Analisando padrão de evento: ${event}`);

    // Exemplo: Se o usuário completa muitas tarefas, ele é "focado em execução"
    if (event === 'task_completed') {
      profile.preferredTypes = [...new Set([...profile.preferredTypes, 'Execução de tarefas'])];
    }

    // Exemplo: Se visualiza muito a timeline, ele é "focado em planejamento"
    if (event === 'view_timeline') {
      profile.preferredTypes = [...new Set([...profile.preferredTypes, 'Planejamento temporal'])];
    }

    memoryStore.saveMemory(memory);
  },

  /**
   * Gera um contexto textual baseado na memória para ser incluído no prompt da IA.
   */
  getRelevantContext(): string {
    const memory = memoryStore.getMemory();
    const profile = memory.userProfile;
    
    let context = "### MEMÓRIA DE LONGO PRAZO DO USUÁRIO\n";
    
    if (profile.frequentActions.length > 0) {
      context += `- Ações frequentes: ${profile.frequentActions.join(', ')}\n`;
    }
    
    if (profile.frequentProjects.length > 0) {
      context += `- Projetos ativos: ${profile.frequentProjects.join(', ')}\n`;
    }

    if (profile.preferredTypes.length > 0) {
      context += `- Preferências: ${profile.preferredTypes.join(', ')}\n`;
    }

    // Se não houver nada, retornar vazio para não poluir o prompt
    if (context === "### MEMÓRIA DE LONGO PRAZO DO USUÁRIO\n") return "";

    return context;
  }
};
