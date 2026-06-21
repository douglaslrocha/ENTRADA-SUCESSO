import { fakeDB } from './fakeDB';
import { db } from '../services/db';
import { CategoryType } from '../types';
import { semanticLifeEngine } from '../services/semanticLifeEngine';
import { existentialCoreEngine } from '../services/existentialCoreEngine';
import { existentialVectorsEngine } from '../services/existentialVectorsEngine';
import { financialSemanticEngine } from '../engines/financialSemanticEngine';
import { financialEpisodeEngine } from '../engines/financialEpisodeEngine';
import { assetCognitiveIndex } from '../engines/assetCognitiveIndex';
import { vaultSemanticMap } from '../engines/vaultSemanticMap';
import { financialObservers } from '../engines/financialObservers';
import { financialCognitiveEngine } from '../services/financialCognitiveEngine';
import { managerSemanticEngine } from '../engines/managerSemanticEngine';
import { presenceService } from '../services/presenceService';
import { BLOCKS } from '../components/IdentityPage';

/**
 * Service to aggregate all system data and provide a clean context for the AI.
 */
export const dataContext = {
  getExistentialContext() {
    const memory = semanticLifeEngine.getLongitudinalMemory(fakeDB.diaries);
    
    // Extrai métricas agregadas inteligentes do Dashboard para nutrição da IA Global
    const savedDashboardSnapshot = localStorage.getItem('dashboard_snapshot');
    let extraMetrics = 'Hábitos: Sem dados | Escrita: Fluxo ordinário | Ambientes: Não mapeados';
    if (savedDashboardSnapshot) {
      try {
        const snap = JSON.parse(savedDashboardSnapshot);
        const consistência = snap.consistencia?.score ?? 85;
        const totalPalavras = snap.producao?.wordCount ?? 0;
        const mediaPalavras = snap.producao?.avgWordsPerDiary ?? 0;
        const locaisAtivos = snap.diario?.places?.slice(0, 3).join(', ') || 'Sem registros';
        extraMetrics = `Aderência a Hábitos: ${consistência}% | Produção Escrita: ${totalPalavras} palavras totais (~${mediaPalavras} p/ entrada) | Ambientes de Sintonia: ${locaisAtivos}`;
      } catch (e) {
        console.warn('[DataContext] Falha sutil ao ler snapshot do dashboard no canal existencial', e);
      }
    }

    // Clean states to avoid prompt size explosion
    const formatState = (state: any) => {
      if (!state) return 'Sem dados suficientes';
      return `Acordar: ${state.averageWakeTime || '--:--'} | Humor: ${state.averageHumor || 7}/10 | Energia: ${state.averageEnergy || 7}/10
Temas: ${state.dominantThemes?.join(', ') || 'Nenhum'}
Pessoas: ${state.recurrentPeople?.join(', ') || 'Nenhuma'}
Símbolos Sonhos: ${state.recurrentSymbols?.join(', ') || 'Nenhum'}
Emoções: ${state.recurrentEmotions?.join(', ') || 'Nenhuma'}
Frequência EV: ${state.evFrequency ?? 0}% das entradas
Evolução: ${state.emotionalEvolution || 'Estável'}
Agregados: ${extraMetrics}
Alertas/Tendências: ${state.trends?.slice(0, 3).join('; ') || 'Estabilidade geral.'}`;
    };

    const todayTxt = memory.today 
      ? `Data: ${memory.today.date} | Acordou: ${memory.today.wakeTime} | Humor: ${memory.today.humor}/10 | EV: ${memory.today.evDetected ? 'Detectado' : 'Não registrado'}`
      : 'Sem registros hoje';

    return {
      todayState: todayTxt,
      weeklyState: formatState(memory.weekly),
      monthlyState: formatState(memory.monthly),
      longitudinalState: formatState(memory.longitudinal)
    };
  },
  getSystemSnapshot() {
    const fakeData = fakeDB.getAll();
    const financialData = db.getTransactions();
    const muralData = db.getMuralData();
    const categories = db.getCategories();

    // Simplify data for the LLM context to avoid hitting token limits
    // and keep focus on relevant relational links.
    return {
      metadata: {
        totalTransactions: financialData.length,
        totalProjects: fakeData.projects.length,
        totalObjectives: fakeData.objectives.length,
        categoriesCount: categories.length,
        oldestRecordDate: financialData.length > 0 ? financialData[financialData.length - 1].date : 'N/A'
      },
      objectives: fakeData.objectives.map(o => ({ 
        id: o.id, 
        title: o.title, 
        type: o.type, 
        progress: fakeDB.getObjectiveProgress(o.id) 
      })),
      goals: fakeData.goals.map(g => ({ 
        id: g.id, 
        title: g.title, 
        objectiveId: g.objectiveId,
        progress: fakeDB.getGoalProgress(g.id)
      })),
      projects: fakeData.projects.map(p => ({ 
        id: p.id, 
        title: p.title, 
        goalId: p.goalId,
        progress: fakeDB.getProjectProgress(p.id)
      })),
      recentTasks: fakeData.tasks.slice(0, 10).map(t => ({ 
        id: t.id, 
        title: t.title, 
        status: t.status, 
        projectId: t.projectId 
      })),
      financial: {
        balance: muralData.netWorth.current_cash,
        recentTransactions: financialData.slice(0, 5).map(tr => {
          const cat = categories.find(c => c.id === tr.category_id);
          return {
            description: tr.note || 'Sem descrição',
            amount: tr.value,
            type: cat?.type === CategoryType.INCOME ? 'income' : 'expense',
            category: cat?.name
          };
        })
      },
      user: {
        name: "Douglas",
        currentDate: new Date().toLocaleDateString('pt-BR'),
        currentTime: new Date().toLocaleTimeString('pt-BR')
      }
    };
  },

  getPromptContext() {
    const snapshot = this.getSystemSnapshot();
    const existential = this.getExistentialContext();
    const coreEx = existentialCoreEngine.getGlobalMemory();
    const vecs = existentialVectorsEngine.getExistentialVectors();
    const finance = financialCognitiveEngine.getFinanceIntelligence();

    // ----------------------------------------------------
    // FASE 8: COGNITIVE FINANCIAL SUMMARIES
    // ----------------------------------------------------
    // 1. Semantic Summary
    const semMemories = Object.values(financialSemanticEngine.getAllMemories());
    const emotionCounts: Record<string, number> = {};
    const behaviorCounts: Record<string, number> = {};
    
    semMemories.forEach(m => {
      emotionCounts[m.emotion] = (emotionCounts[m.emotion] || 0) + 1;
      behaviorCounts[m.behavior] = (behaviorCounts[m.behavior] || 0) + 1;
    });

    const semanticEmotions = Object.entries(emotionCounts).map(([emotion, count]) => `${emotion} (${count}x)`).join(', ') || 'Equilíbrio emocional pleno';
    const semanticBehaviors = Object.entries(behaviorCounts).map(([behavior, count]) => `${behavior} (${count}x)`).join(', ') || 'Alocação equilibrada';
    const financialSemanticSummary = `Gastos Associados a Estados Emocionais: ${semanticEmotions} | Gatilhos Comportamentais de Compras: ${semanticBehaviors}`;

    // 2. Episodes
    const episodes = financialEpisodeEngine.getEpisodes();
    const financialEpisodes = episodes.slice(0, 5).map(e => `- Período: ${e.period} | Evento: "${e.event}" | Impacto: R$ ${e.impact.toLocaleString('pt-BR')} (Significado: ${e.meaning})`).join('\n') || 'Nenhum episódio relevante registrado.';

    // 3. Trends/Alerts
    const alerts = financialObservers.generateAlerts();
    const financialTrends = alerts.map(a => `- [Severidade: ${a.severity.toUpperCase()}] ${a.message}`).join('\n') || 'Metas e orçamentos operando perfeitamente.';

    // 4. Asset Index
    const assetsIdx = Object.values(assetCognitiveIndex.getIndex());
    const assetIndexStr = assetsIdx.map(a => `- Ativo ID: ${a.assetId.slice(0, 5)} | Classe: ${a.type} (${a.category}) | Localização: ${a.location} | Risco: ${a.risk} | Auditoria Docs: ${a.documentStatus}`).join('\n') || 'Nenhum ativo catalogado no índice cognitivo.';

    // 5. Vault Summary Map
    const vaultSecMap = Object.values(vaultSemanticMap.getSemanticMap());
    const vaultSummaryStr = vaultSecMap.map(v => `- Nível: ${v.criticality} | Classificação: ${v.classification} (${v.type}) | Acesso Registrado: ${v.lastAccess}`).join('\n') || 'Cofre vazio.';

    // MÓDULO: PRESENÇAS — MOTOR DE INFLUÊNCIA EXISTENCIAL (Estritamente Relacional)
    const allPresences = presenceService.getPresences();
    const presencesStr = allPresences.map(p => 
      `- ${p.name}: peso: ${p.peso !== undefined ? p.peso.toFixed(1) : '5.0'}/10 | ativa: ${p.influencia || 'Não definida'} | acionar_quando: ${p.acionar_quando || 'Não definido'} | DNA: ${p.dna || 'Não definido'}`
    ).join('\n') || 'Nenhuma presença existencial cadastrada.';

    // MÓDULO: IDENTIDADE PESSOAL — MOTOR DE COERÊNCIA EXISTENCIAL (DNA Consciente, < 500 tokens)
    let identityStr = 'Nenhuma resposta de identidade declarada ainda.';
    try {
      const savedAnswers = localStorage.getItem('identity_answers');
      if (savedAnswers) {
        const answers = JSON.parse(savedAnswers);
        const segments: string[] = [];
        const prioritizedBlockIds = ['professional', 'emotional', 'financial', 'relationships', 'discipline', 'future'];
        
        BLOCKS.forEach(block => {
          if (prioritizedBlockIds.includes(block.id)) {
            block.inputs.forEach((input: any) => {
              const ans = answers[input.id];
              if (ans && ans.trim()) {
                segments.push(`- Bloco: ${block.label} | Pergunta: ${input.label} -> Resposta: ${ans.trim()}`);
              }
            });
          }
        });
        
        if (segments.length > 0) {
          identityStr = segments.slice(0, 12).join('\n'); // Ensure compact budget (100-500 tokens)
        }
      }
    } catch (e) {
      console.warn('[DataContext] Falha sutil ao ler respostas de identidade', e);
    }

    return `
### ESTADO ATUAL DO SISTEMA (CONTEXTO DE DADOS)
Usuário: ${snapshot.user.name} | Data: ${snapshot.user.currentDate} | Hora: ${snapshot.user.currentTime}

#### CÉREBRO GLOBAL & CONSCIÊNCIA EXISTENCIAL (ORGANISMO INTEGRADO):
- Mente: Sonhos: ${coreEx.mind.dreamSymbols.join(', ')} | Emoções: ${coreEx.mind.recurrentEmotions.join(', ')} | Insights: ${coreEx.mind.insightsCount}
- Vitalidade: Energia Média: ${coreEx.energy.avgEnergy}/10 | EV Freq: ${coreEx.energy.evFrequency}% | Sintonia: ${coreEx.energy.highEnergyPlaces}
- Sono: Despertar: ${coreEx.sleep.avgWakeTime} | Repouso: ${coreEx.sleep.avgSleepTime}
- Hábitos: Consistência: ${coreEx.habits.consistency}% | Concluídos Hoje: ${coreEx.habits.checkedToday}
- Foco & Metas: Coeficiente: ${coreEx.focus.avgFocus}/10 (~${coreEx.focus.activeHours}h de foco) | Objetivos: ${coreEx.goals.completed}/${coreEx.goals.total} concluídos (${coreEx.goals.progress.toFixed(0)}% avanço médio)
- Finanças: Saldo: R$ ${coreEx.finance.balance.toLocaleString('pt-BR')} | Burn Mensal: R$ ${coreEx.finance.monthlyBurn.toLocaleString('pt-BR')} | Saúde: ${coreEx.finance.financialHealth}
- Social: Pessoas Recorrentes: ${coreEx.social.recurrentPeople.join(', ')} | Mentores: ${coreEx.social.mentorSintonia ? 'Sintonia Sincronizada' : 'Intermitente'}
- Análise de Padrões: Evolução Emocional: ${coreEx.patterns.emotionalEvolution} | Tendências: ${coreEx.patterns.criticalTrends.join('; ')}
- Correlações Psicossomáticas:
  * Campo Energético & Lucidez: ${coreEx.correlations.energyVsLucidity}
  * Sono & Desempenho Cognitivo: ${coreEx.correlations.sleepVsFoco}
- Longitudinal Histórico: ${coreEx.longitudinal.totalRegisters} diários consolidados analisados em ${coreEx.longitudinal.yearsProjected} anos de vida real.

ORGANIZAÇÃO, WORKSPACES E GERENCIADOR DE CONHECIMENTOS:
- Workspaces: ${coreEx.organization.workspaceCount} ativos | Pastas: ${coreEx.organization.folderCount} catalogadas
- Patrimônio/Linhas de Ativo: ${coreEx.assets.categories.join(', ') || 'Sem registros'}
- Operações: Projetos (${coreEx.operations.activeProjects}) | Metas (${coreEx.operations.activeGoals}) | Tarefas (${coreEx.operations.activeTasks})
- Tópicos de Conhecimento Relevantes: ${coreEx.knowledge.recurringTopics.join(', ') || 'Nenhum'}
- Resumos Semânticos de Documentos e Conhecimentos Ativos:
${managerSemanticEngine.getSummary()}

Vetores:
Projeções [${vecs.projectionHistory.slice(-7).join(',')}]

#### VETORES EXISTENCIAIS:
Energia semanal:
[${vecs.energyHistory.slice(-7).join(',')}]

Humor:
[${vecs.humorHistory.slice(-7).join(',')}]

Sono:
[${vecs.sleepHistory.slice(-7).join(',')}]

Foco:
[${vecs.focusHistory.slice(-7).join(',')}]

Consistência:
[${vecs.consistencyHistory.slice(-7).join(',')}]

EV:
[${vecs.evHistory.slice(-7).join(',')}]

#### MEMÓRIA EXISTENCIAL DO DIÁRIO (LONGITUDINAL):
- Hoje: ${existential.todayState}
- Semanal: ${existential.weeklyState}
- Mensal: ${existential.monthlyState}
- Histórico de Longo Prazo (Longitudinal): ${existential.longitudinalState}

#### FORÇAS DE PRESENÇAS EXISTENCIAIS (ESTRITAMENTE RELACIONAL):
${presencesStr}

#### IDENTIDADE PESSOAL DECLARADA (DNA CONSCIENTE):
${identityStr}

#### INTELIGÊNCIA FINANCEIRA COGNITIVA SENSÍVEL E LONGITUDINAL (AMPARADORA COGNITION v2):
Este módulo fornece a inteligência de negócios e autoconhecimento financeiro profundo do usuário:
- Síntese de Memória Semântica: ${financialSemanticSummary}
- Alertas Ativos e Desvios de Planejamento:
${financialTrends}
- Episódios Narrativos e Ciclos Notórios:
${financialEpisodes}
- Índice de Ativos Físicos e Imobiliários (Clean Index):
${assetIndexStr}
- Metadados Semânticos de Itens Protegidos (Cofre):
${vaultSummaryStr}

#### INTELIGÊNCIA FINANCEIRA:
Saúde:
${finance.healthScore}

Burn:
${finance.burnRate}

Reserva:
${finance.reserveMonths}

Categorias:
${finance.dominantCategories.join(',')}

Projeções:
[${vecs.financialProjectionHistory.slice(-7).join(',')}]

#### OBJETIVOS ESTRATÉGICOS:
${snapshot.objectives.length > 0 ? snapshot.objectives.map(o => `- [${o.type}] ${o.title} (${o.progress}% progress)`).join('\n') : "Nenhum objetivo definido."}

#### PROJETOS ATIVOS:
${snapshot.projects.length > 0 ? snapshot.projects.slice(0, 10).map(p => `- ${p.title} (${p.progress}% concluído)`).join('\n') : "Nenhum projeto ativo."}

#### STATUS FINANCEIRO:
Saldo Atual: R$ ${snapshot.financial.balance.toLocaleString('pt-BR')}
Últimas Transações:
${snapshot.financial.recentTransactions.map(t => `- ${t.description}: R$ ${t.amount} (${t.type === 'expense' ? 'Despesa' : 'Receita'})`).join('\n')}

#### TAREFAS RECENTES:
${snapshot.recentTasks.map(t => `- ${t.title} [${t.status}]`).join('\n')}
`;
  }
};
