import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Activity, ShieldCheck, ArrowUpRight, TrendingUp, Compass, Heart, Zap, Award, Layers, Lock, Calendar, BookOpen, Clock, AlertTriangle, Shield, X, ChevronRight, Sliders, Play, CheckCircle, Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Transaction } from '../types';
import { backgroundService } from '../services/backgroundService';
import { dashboardSemanticService } from '../services/dashboardSemanticService';
import { existentialFinancialService } from '../services/existentialFinancialService';
import { useOrganismSync } from '../hooks/useOrganismSync';

interface DashboardProps {
  onNavigate: (view: any) => void;
  categories: Category[];
  transactions: Transaction[];
  onRefreshCategories: () => void;
  onToggleSidebar: () => void;
}

const MagicIcon = React.memo(() => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'translateZ(0)' }}>
    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));

const MOCK_PHRASES = [
  "Sua execução está 12% acima da média histórica. Mantenha o ritmo.",
  "Consistência detectada em 85% dos pilares. Você está em zona de aceleração.",
  "Arquitetura de metas sólida. O desvio operacional é mínimo esta semana.",
  "Eficiência produtiva em nível máximo. Hora de focar em objetivos macro."
];

// DADOS EXPANDIDOS — RELATÓRIO DE INTELIGÊNCIA OPERACIONAL (L3)
const expandedAnalysisData: Record<string, any> = {
  tempo: {
    diagnosticoProfundo: "Você está pulverizando seu foco em janelas de transição. O sistema detectou que 40% das suas tarefas 'rápidas' estão acontecendo entre 09h e 11h, destruindo sua capacidade de entrar em estado de fluxo profundo. Isso gera um desgaste mental invisível que faz você chegar às 15h operando com apenas 60% da sua capacidade cognitiva real.",
    atrasoHoje: [
      "Reuniões curtas no meio da manhã que quebram o foco.",
      "Troca constante de abas/contexto no início do dia.",
      "Falta de um 'fechamento' claro de blocos de tempo."
    ],
    mudancaRecente: {
      data: [70, 75, 68, 82, 85, 78, 80],
      interpretation: "Sua execução está subindo (+5%), mas ainda abaixo do seu pico ideal. Mantendo o padrão atual, você recupera o ritmo total em 4 dias."
    },
    seContinuarAssim: "Você vai acumular tarefas densas para o final da semana, o que vai gerar um pico de estresse no domingo e comprometer o início da próxima segunda.",
    impactoObjetivos: "Atraso de 3 dias no marco principal de 'Lançamento' devido ao tempo perdido com micro-gestão.",
    oQueFazerAgora: [
      { task: "Bloqueio Total de Tela", when: "Agora até às 11:30", why: "Para recuperar o atraso da tarefa principal." },
      { task: "Desligar Notificações", when: "Imediato", why: "Eliminar o ruído que está fragmentando sua tarde." },
      { task: "Batching de Emails", when: "17:30", why: "Mover o trabalho reativo para o final da energia." }
    ],
    resultadoEsperado: "Recuperação de 1.5h de trabalho puro hoje e redução de 20% no cansaço mental ao fim do dia."
  },
  objetivos: {
    diagnosticoProfundo: "Existe um conflito real entre sua meta de 'Expansão' e suas tarefas diárias de 'Manutenção'. Você está priorizando o que é urgente em vez do que é importante. Isso cria uma sensação de movimento sem progresso real. O sistema mostra que 3 meta secundárias estão drenando 50% da sua energia estratégica.",
    atrasoHoje: [
      "Excesso de tempo em networking de baixo impacto.",
      "Metas secundárias sem prazo definido 'poluindo' a visão.",
      "Falta de revisão de métricas de avanço real."
    ],
    mudancaRecente: {
      data: [30, 35, 40, 38, 42, 45, 43],
      interpretation: "O avanço nas metas é constante, mas lento. Você está 'andando' quando deveria estar 'correndo' nos pilares de alto impacto."
    },
    seContinuarAssim: "Sua meta principal de semestre corre o risco de ser empurrada para o próximo trimestre, perdendo a janela de mercado atual.",
    impactoObjetivos: "Risco de 25% de falha no objetivo 'Crescimento 2X' por falta de alocação de tempo específica.",
    oQueFazerAgora: [
      { task: "Arquivar Metas Zumbis", when: "Fim do expediente", why: "Limpar o horizonte mental para o que importa." },
      { task: "Alocação Direta Q1", when: "Amanhã 08:00", why: "Garantir que a primeira ação do dia seja estratégica." }
    ],
    resultadoEsperado: "Aumento de 30% na velocidade de convergência para o objetivo principal em 7 dias."
  },
  execucao: {
    diagnosticoProfundo: "Sua execução é forte, mas o setup inicial é seu maior gargalo. Você demora 45 minutos para realmente começar a produzir 'trabalho de elite' após ligar o computador. Esse 'custo de partida' está roubando o equivalente a 3 horas de produção real por semana.",
    atrasoHoje: [
      "Processo manual de triagem que poderia ser automatizado.",
      "Indecisão sobre qual tarefa atacar primeiro.",
      "Ambiente digital desorganizado (muitas abas abertas de ontem)."
    ],
    mudancaRecente: {
      data: [80, 85, 90, 88, 92, 95, 94],
      interpretation: "Padrão de execução estável. Você é muito eficiente uma vez que começa, o problema é o 'start'."
    },
    seContinuarAssim: "Você vai continuar sentindo que o dia 'passa voando' sem que você tenha feito o que realmente precisava logo cedo.",
    impactoObjetivos: "O gargalo no setup está impedindo você de atingir o nível 'Elite' de produtividade constante.",
    oQueFazerAgora: [
      { task: "Setup Noturno de Lista", when: "Hoje às 21:00", why: "Para começar amanhã já sabendo exatamente o que fazer." },
      { task: "Limpeza de Desktop", when: "Fim do dia", why: "Reduzir o atrito visual na próxima inicialização." }
    ],
    resultadoEsperado: "Redução do tempo de setup de 45min para 10min, ganhando 35min de foco puro/dia."
  },
  financeiro: {
    diagnosticoProfundo: "Foi detectado um 'vazamento de capital' de 18% no seu fluxo livre. O custo de conveniência (transporte e comida rápida) subiu silenciosamente 22% nos últimos 15 dias. Além disso, existe uma exposição de R$ 450 em assinaturas recorrentes que não foram utilizadas nos últimos 30 dias.",
    atrasoHoje: [
      "Assinaturas automáticas sem auditoria (Netflix, SaaS, Apps).",
      "Gastos impulsivos em janelas de baixa energia (especialmente após as 20h).",
      "Ausência de provisionamento para aportes trimestrais."
    ],
    mudancaRecente: {
      data: [60, 65, 70, 68, 75, 80, 78],
      interpretation: "A margem operacional está se recuperando, mas a taxa de poupança real ainda está 5% abaixo da meta estabelecida no início do ano."
    },
    seContinuarAssim: "O fechamento do próximo trimestre apresentará um déficit operacional de R$ 2.800, forçando um resgate de reserva de emergência.",
    impactoObjetivos: "Risco crítico: a meta 'Liberdade Financeira' pode atrasar 6 meses se o snowball de juros compostos for interrompido.",
    oQueFazerAgora: [
      { task: "Auditoria Total de 'Cortes'", when: "Hoje às 18:30", why: "Eliminar assinaturas inúteis e renegociar planos fixos." },
      { task: "Bloqueio de Gastos Variáveis", when: "Próximas 48h", why: "Zerar o consumo não-essencial para estabilizar o caixa." },
      { task: "Sincronização de Aportes", when: "Amanhã 09:00", why: "Mover o excedente identificado para a corretora." }
    ],
    resultadoEsperado: "Recuperação imediata de R$ 1.200/mês e proteção integral do patrimônio de longo prazo."
  },
  consistencia: {
    diagnosticoProfundo: "Sua resiliência estratégica é de 94%. O sistema não detectou falhas críticas nos seus hábitos ancorados nos últimos 24 dias. No entanto, a 'intensidade' dessas execuções caiu 10%, sugerindo que você está apenas 'cumprindo tabela' em alguns pilares fundamentais.",
    atrasoHoje: [
      "Execução de hábitos no piloto automático sem presença total.",
      "Falta de desafio ou progressão nos micro-hábitos.",
      "Ambiente de apoio (pista visual) começando a ficar poluído."
    ],
    mudancaRecente: {
      data: [90, 95, 92, 98, 100, 100, 96],
      interpretation: "A curva de manutenção é perfeita. O desafio agora não é a frequência, mas a profundidade e o impacto de cada ação."
    },
    seContinuarAssim: "Você vai atingir um platô de performance onde o esforço é mantido, mas o resultado para de crescer exponencialmente.",
    impactoObjetivos: "Estagnação no pilar de 'Mestria' se não houver introdução de novos níveis de dificuldade.",
    oQueFazerAgora: [
      { task: "Progressão de Carga Cognitiva", when: "Segunda 07:00", why: "Aumentar a dificuldade dos hábitos centrais." },
      { task: "Reset Visual do Espaço", when: "Hoje 20:00", why: "Remover ruídos que facilitam a execução medíocre." }
    ],
    resultadoEsperado: "Salto de 15% na qualidade do output mesmo mantendo a mesma carga horária."
  },
  producao: {
    diagnosticoProfundo: "Seu volume de output subiu 40%, mas a taxa de revisão técnica caiu para 12%. Isso indica que você está gerando muita 'matéria-prima' mas está negligenciando a etapa de refinamento e curadoria. O conhecimento está sendo acumulado de forma bruta, o que dificulta a recuperação futura via IA.",
    atrasoHoje: [
      "Acúmulo de notas sem tags ou conexões semânticas.",
      "Falta de um horário fixo para 'Poda e Refino' de documentos.",
      "Dependência excessiva de resumos automáticos sem leitura crítica."
    ],
    mudancaRecente: {
      data: [30, 50, 45, 60, 75, 80, 85],
      interpretation: "O volume é recorde, mas o tempo médio por documento caiu. Qualidade deve ser o foco da próxima semana."
    },
    seContinuarAssim: "Você terá um 'cemitério digital' de informações inúteis que vão poluir seu contexto de IA e gerar respostas alucinadas.",
    impactoObjetivos: "Atraso no pilar de 'Mestria Técnica' por falta de profundidade analítica nos registros.",
    oQueFazerAgora: [
      { task: "Auditoria de Tags", when: "Fim do dia", why: "Garantir que as ideias de hoje sejam encontradas amanhã." },
      { task: "Sessão de Refino", when: "Amanhã 14:00", why: "Transformar 3 rascunhos em 1 documento definitivo." }
    ],
    resultadoEsperado: "Redução de 30% no ruído informacional e aumento de 20% na utilidade dos seus documentos."
  },
  inteligencia: {
    diagnosticoProfundo: "Sua sinapse digital com a IA está em nível 'Power User', mas você está delegando 80% das tarefas lógicas sem conferência. A IA detectou que você economizou 14h de trabalho bruto, mas seu 'olhar crítico' sobre as saídas diminuiu, o que pode gerar erros de julgamento em decisões macro.",
    atrasoHoje: [
      "Uso de prompts genéricos para problemas complexos.",
      "Falta de validação cruzada entre diferentes modelos de IA.",
      "Ausência de registro de 'Prompts de Sucesso'."
    ],
    mudancaRecente: {
      data: [10, 20, 40, 60, 75, 85, 90],
      interpretation: "Sua integração é vertical e profunda. Você já opera como um 'Cyborg' funcional em 4 pilares."
    },
    seContinuarAssim: "Você perderá a habilidade de resolver problemas do zero sem assistência, criando uma dependência técnica perigosa.",
    impactoObjetivos: "Risco latente de 'Erosão de Habilidade' no pilar de Resolução de Problemas.",
    oQueFazerAgora: [
      { task: "Treino Solo de Lógica", when: "Hoje 22:00", why: "Resolver um problema manual para manter a agilidade mental." },
      { task: "Otimização de Prompts", when: "Próxima sessão", why: "Criar templates de sistema para tarefas recorrentes." }
    ],
    resultadoEsperado: "Aumento da precisão das saídas de IA de 88% para 96%."
  },
  sistema: {
    diagnosticoProfundo: "A integridade do seu 'Sistema de Vida' é de 99.9%. Não há latência de dados e a sincronia entre pilares está em harmonia. O único ponto latente é o 'Custo de Manutenção': você gasta 15% do seu tempo útil apenas gerenciando o sistema, o que é um sinal de over-engineering.",
    atrasoHoje: [
      "Micro-ajustes manuais em dashboards que poderiam ser automatizados.",
      "Excesso de check-ins diários (mais de 12 por dia).",
      "Falta de simplificação em fluxos de tarefa secundários."
    ],
    mudancaRecente: {
      data: [90, 92, 91, 93, 92, 94, 92],
      interpretation: "Estabilidade total. O sistema é invisível e potente, mas pode ser mais enxuto."
    },
    seContinuarAssim: "A complexidade do sistema vai começar a pesar mais que o benefício que ele entrega.",
    impactoObjetivos: "Desvio de 10% da energia produtiva para 'Cuidado com a Ferramenta'."
  },
  correlacoes: {
    diagnosticoProfundo: "Existe uma correlação fortíssima (+0.82) entre sua qualidade de sono e sua taxa de execução variável. Dias com menos de 6h de sono resultam em um aumento de 35% em gastos impulsivos (Aba Financeira) e uma queda de 20% no Deep Work (Aba Tempo). Seu sistema é um ecossistema interdependente.",
    atrasoHoje: [
      "Negligência com pilares de suporte (saúde/sono) afetando pilares de saída.",
      "Falta de visão sistêmica ao planejar a semana.",
      "Ignorar sinais de cansaço mental precoce."
    ],
    mudancaRecente: {
      data: [50, 60, 70, 75, 80, 82, 85],
      interpretation: "Você está começando a entender que um pilar carrega o outro. A harmonia está subindo."
    },
    seContinuarAssim: "Você terá picos de produtividade seguidos por vales profundos de exaustão, impedindo o progresso linear.",
    impactoObjetivos: "Risco de inconsistência no longo prazo.",
    oQueFazerAgora: [
      { task: "Priorização de Sono", when: "Hoje 22:30", why: "Recuperar a clareza mental e reduzir o viés de impulsividade." },
      { task: "Análise de Gatilhos", when: "Fim do dia", why: "Identificar quais emoções estão gerando gastos variáveis." }
    ],
    resultadoEsperado: "Estabilização da energia diária e redução de 15% na procrastinação reativa."
  },
  previsoes: {
    diagnosticoProfundo: "Seu 'Horizonte de Conclusão' está se movendo para a esquerda (mais cedo). Mantendo o momentum atual de 88% de execução, você antecipará o objetivo principal em 14 dias. Contudo, a margem financeira atual é o único sinal amarelo que pode frear essa aceleração no próximo mês.",
    atrasoHoje: [
      "Sobrepujança de otimismo no planejamento de curto prazo.",
      "Não contabilizar feriados ou eventos externos na projeção de 30 dias.",
      "Falta de margem de segurança para imprevistos técnicos."
    ],
    mudancaRecente: {
      data: [40, 45, 50, 55, 58, 60, 55],
      interpretation: "Previsão estável. O algoritmo confia em 90% na data estimada de entrega."
    },
    seContinuarAssim: "Você chegará ao destino, mas poderá estar 'sem fôlego' financeiro ou mental no momento da chegada.",
    impactoObjetivos: "Probabilidade de 84% de sucesso absoluto no marco de Q4.",
    oQueFazerAgora: [
      { task: "Ajuste de Cronograma", when: "Amanhã 08:30", why: "Adicionar margem de 15% para imprevistos no Q2." },
      { task: "Simulação de Stress", when: "Hoje 17:00", why: "Verificar impacto de um imprevisto financeiro nas metas." }
    ],
    resultadoEsperado: "Segurança psicológica de 95% na entrega dos marcos sem sobressaltos."
  }
};

// DADOS PROFUNDOS — CAMADA DE ANÁLISE AVANÇADA (EVOLUÍDA)
const dashboardDeepData: Record<string, any> = {
  tempo: {
    title: "Análise Temporal",
    summary: "Distribuição de foco e janelas de produtividade.",
    mainMetric: "6.2h",
    subLabel: "Foco Diário Médio",
    interpretation: "Alta performance",
    status: "saudável",
    trend: [40, 55, 45, 70, 85, 80, 95],
    insight: "Seu 'Deep Work' atinge o pico entre 09:00 e 11:30.",
    action: "Bloqueie esse horário para tarefas críticas nos próximos 5 dias para maximizar o momentum.",
    crossInsight: "Sua produção intelectual (Aba Produção) subiu 15% após estabilizar esse bloco de tempo.",
    metrics: [
      { label: "Foco Profundo", value: "3.5h/dia" },
      { label: "Gestão & Ops", value: "1.2h/dia" },
      { label: "Tempo de Recuperação", value: "45min" }
    ]
  },
  objetivos: {
    title: "Evolução de Metas",
    summary: "Progresso granular dos OKRs e KPIs pessoais.",
    mainMetric: "12",
    subLabel: "Marcos Ativos",
    interpretation: "Em evolução",
    status: "atenção",
    trend: [20, 25, 30, 28, 35, 40, 38],
    insight: "O objetivo 'Expansão de Carreira' avançou 15% nos últimos 7 dias.",
    action: "Reavalie a meta 'Networking' — ela está estagnada há 12 dias e pode virar um gargalo.",
    crossInsight: "A falta de execução em Metas Ativas está impactando sua saúde do Sistema (Aba Sistema).",
    metrics: [
      { label: "Metas Trimestrais", value: "4" },
      { label: "Hábitos Ancorados", value: "8" },
      { label: "Taxa de Sucesso", value: "92%" }
    ]
  },
  execucao: {
    title: "Eficiência Operacional",
    summary: "Volume de saída vs capacidade teórica.",
    mainMetric: "88%",
    subLabel: "Taxa de Entrega",
    interpretation: "Execução forte",
    status: "saudável",
    trend: [60, 70, 65, 85, 90, 88, 92],
    insight: "Terças-feiras são seus dias de maior volume produtivo.",
    action: "Mova reuniões de alinhamento para Segundas para liberar as Terças para execução pura.",
    crossInsight: "Sua alta eficácia aqui explica o excedente no fluxo de caixa livre (Aba Financeiro).",
    metrics: [
      { label: "Tasks Semanais", value: "124" },
      { label: "Bloqueios Resolvidos", value: "18" },
      { label: "Lead Time Médio", value: "1.2 dias" }
    ]
  },
  consistencia: {
    title: "Engenharia de Hábito",
    summary: "Frequência e resiliência na manutenção da rotina.",
    mainMetric: "24d",
    subLabel: "Streak Atual",
    interpretation: "Hábito consolidado",
    status: "saudável",
    trend: [80, 85, 85, 90, 95, 100, 100],
    insight: "A barreira dos 21 dias foi superada. O viés cognitivo agora favorece a manutenção.",
    action: "Inicie a introdução de um novo micro-hábito complementar agora que a base está sólida.",
    crossInsight: "Sua consistência é o motor principal da sua Produção Intelectual estável.",
    metrics: [
      { label: "Frequência Mensal", value: "94%" },
      { label: "Resiliência", value: "Alta" },
      { label: "Desvio Padrão", value: "0.4" }
    ]
  },
  producao: {
    title: "Output Intelectual",
    summary: "Volume de criação e processamento de conhecimento.",
    mainMetric: "18.4k",
    subLabel: "Palavras Processadas",
    interpretation: "Alta produção",
    status: "saudável",
    trend: [30, 50, 45, 60, 75, 80, 85],
    insight: "Seu volume de escrita aumentou com o uso de novas ferramentas de IA.",
    action: "Agende uma sessão de revisão profunda hoje; o volume é alto, mas a densidade precisa de ajuste.",
    crossInsight: "O aumento aqui está diretamente ligado ao tempo de pesquisa salvo (Aba Inteligência).",
    metrics: [
      { label: "Documentos", value: "47" },
      { label: "Ideias Capturadas", value: "156" },
      { label: "Taxa de Revisão", value: "12%" }
    ]
  },
  inteligencia: {
    title: "Sinapse Digital",
    summary: "Interação e aproveitamento de insights de IA.",
    mainMetric: "89",
    subLabel: "Interações Estratégicas",
    interpretation: "Mente expandida",
    status: "saudável",
    trend: [10, 20, 40, 60, 75, 85, 90],
    insight: "Você está delegando 22% mais tarefas lógicas para a IA este mês.",
    action: "Explore novos modelos de raciocínio para a etapa de 'Projeções' (Aba Previsões).",
    crossInsight: "Essa alavancagem liberou 14h de foco puro para Análise Temporal (Aba Tempo).",
    metrics: [
      { label: "Prompts Otimizados", value: "42" },
      { label: "Modelos", value: "3" },
      { label: "Tempo Salvo", value: "14h" }
    ]
  },
  financeiro: {
    title: "Arquitetura Econômica",
    summary: "Monitoramento intensivo de fluxo e proteção de margem.",
    mainMetric: "R$ 14.2k",
    subLabel: "Saldo em Risco",
    interpretation: "Atenção a Custos",
    status: "atenção",
    trend: [85, 80, 75, 90, 88, 82, 78],
    insight: "Sua eficiência de gastos caiu 12% devido a custos fixos ocultos e 'vazamentos' de conveniência.",
    action: "Inicie uma auditoria completa na página de 'Cortes' para estancar a saída de capital não planejada.",
    crossInsight: "O aumento aqui está correlacionado com o estresse detectado no sub-bloco de Performance.",
    metrics: [
      { label: "Taxa de Poupança", value: "24.5%" },
      { label: "Cortes Pendentes", value: "R$ 1.200" },
      { label: "Margem Livre", value: "R$ 2.450" }
    ]
  },
  sistema: {
    title: "Health Check",
    summary: "Monitoramento de performance do sistema de vida.",
    mainMetric: "92%",
    subLabel: "Eficiência Geral",
    interpretation: "Monitoramento total",
    status: "saudável",
    trend: [90, 92, 91, 93, 92, 94, 92],
    insight: "Nenhum gargalo sistêmico detectado nas últimas 48 horas.",
    action: "Mantenha a rotina de sincronização noturna para garantir integridade dos dados.",
    crossInsight: "Sua latência de decisão está em nível mínimo recorde.",
    metrics: [
      { label: "Latência", value: "Baixa" },
      { label: "Sincronia", value: "100%" },
      { label: "Riscos", value: "0" }
    ]
  },
  correlacoes: {
    title: "Matriz de Causa e Efeito",
    summary: "Como um pilar influencia o desempenho do outro.",
    mainMetric: "+0.82",
    subLabel: "Correlação Médias",
    interpretation: "Relação Forte",
    status: "saudável",
    trend: [50, 60, 70, 75, 80, 82, 85],
    insight: "Dias com mais de 7h de sono resultam em +15% na taxa de execução.",
    action: "Priorize o sono hoje para compensar o estresse acumulado na Aba Financeira.",
    crossInsight: "Seu pilar de Consistência é o que mais empurra todas as outras métricas para cima.",
    metrics: [
      { label: "Foco x Prod", value: "0.75" },
      { label: "Fin x Stress", value: "-0.42" },
      { label: "Hab x Obj", value: "0.88" }
    ]
  },
  previsoes: {
    title: "Projeções Algorítmicas",
    summary: "Tendências futuras baseadas em dados históricos.",
    mainMetric: "90d",
    subLabel: "Horizonte Visível",
    interpretation: "Alta confiança",
    status: "atenção",
    trend: [40, 45, 50, 55, 58, 60, 55],
    insight: "No ritmo atual, você concluirá seu objetivo anual principal em Novembro.",
    action: "Aumente o ritmo em 5% para antecipar a conclusão para Outubro e evitar a sazonalidade.",
    crossInsight: "Seu Risco de Burnout subiu levemente para 12% devido ao aumento de Produção.",
    metrics: [
      { label: "Probabilidade", value: "84%" },
      { label: "Risco Burnout", value: "12%" },
      { label: "Crescimento", value: "6%/mês" }
    ]
  }
};

const TAB_METADATA: Record<string, { label: string; icon: any; desc: string }> = {
  tempo: { label: "Tempo & Rotina", icon: Clock, desc: "Foco e cronobiologia" },
  diario: { label: "Diário de Vida", icon: BookOpen, desc: "Autoconhecimento" },
  objetivos: { label: "Metas de Vida", icon: Award, desc: "Sistêmicos & OKRs" },
  execucao: { label: "Execuções", icon: Sliders, desc: "Conclusão prática" },
  consistencia: { label: "Consistência", icon: Zap, desc: "Hábitos vivos" },
  producao: { label: "Corpus Escrito", icon: Layers, desc: "Análise quantitativa" },
  inteligencia: { label: "Intuições & Ideias", icon: Compass, desc: "Símbolos e conexões" },
  financeiro: { label: "Dinheiro Proéxis", icon: TrendingUp, desc: "Sustento da Programação Existencial" },
  sistema: { label: "Integridade", icon: Shield, desc: "Segurança total" },
  correlacoes: { label: "Causa & Efeito", icon: Sliders, desc: "Matrizes cruzadas" },
  previsoes: { label: "Projeções", icon: Sparkles, desc: "Horizonte visível" }
};

export function Dashboard({ onNavigate, categories, transactions, onRefreshCategories, onToggleSidebar }: DashboardProps) {
  const syncKey = useOrganismSync();

  const dashboardDeepData = React.useMemo(() => {
    return dashboardSemanticService.generateDashboardDeepData(categories, transactions);
  }, [categories, transactions, syncKey]);

  const existentialInsight = React.useMemo(() => {
    return existentialFinancialService.calculateExistentialInsight(transactions, categories);
  }, [transactions, categories, syncKey]);

  const expandedAnalysisData = React.useMemo(() => {
    return dashboardSemanticService.generateExpandedAnalysisData(categories, transactions);
  }, [categories, transactions, syncKey]);

  const [bgImages, setBgImages] = useState(() => backgroundService.getImages('dashboard'));
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.page === 'dashboard') {
        const newImages = backgroundService.getImages('dashboard');
        setBgImages(newImages);
        setBgIndex(0);
      }
    };
    window.addEventListener('backgrounds-updated', handleUpdate);
    return () => window.removeEventListener('backgrounds-updated', handleUpdate);
  }, []);

  const navigate = useNavigate();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [activeDeepTab, setActiveDeepTab] = useState("tempo");
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);

  // Forçar scroll para o topo ao montar a página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Rotação de fundo e frases
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % bgImages.length);
      setPhraseIndex(prev => (prev + 1) % MOCK_PHRASES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [bgImages]);

  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans overflow-x-hidden">
      {/* NAVEGAÇÃO SUPERIOR FIXA - PADRÃO DIÁRIO */}
      <nav className="fixed top-4 left-4 right-4 md:top-8 md:left-8 md:right-8 z-50 flex justify-between items-center pointer-events-auto">
        <div className="pointer-events-auto">
          <button 
            onClick={onToggleSidebar}
            className="px-4 pt-[7px] pb-[7px] md:w-[111.613px] md:h-[71.3075px] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-[14px] flex items-center justify-center gap-2 md:gap-3 hover:bg-white/20 transition-all group shadow-lg mr-0 mb-0 pointer-events-auto"
          >
            <span className="material-symbols-outlined text-[var(--text)] group-hover:text-[var(--text)] text-sm md:text-base opacity-70">menu</span>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text)] group-hover:text-[var(--text)] opacity-70">Menu</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3 pointer-events-auto text-[var(--text)]">
          <button 
            onClick={() => navigate('/identity')}
            className="px-3 py-2 md:px-6 md:py-3 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center hover:bg-white/20 transition-all group shadow-lg pr-[35px] mr-[-26px] md:mr-[-35px] md:w-[206.4px]"
          >
            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 group-hover:opacity-100 whitespace-nowrap translate-x-[4px] md:translate-x-[10px] inline-block">Douglas L. Rocha</span>
          </button>
          <button 
            onClick={() => navigate('/identity-view')}
            className="w-10 h-10 md:w-[50.6565px] md:h-[50.6565px] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-[var(--border)] rounded-[14px] flex items-center justify-center hover:bg-white/20 transition-all group shadow-lg overflow-hidden"
          >
            <div className="opacity-70 group-hover:opacity-100 transition-opacity">
              <MagicIcon />
            </div>
          </button>
        </div>
      </nav>

      {/* HERO SECTION - EXPERIÊNCIA DE ALTO IMPACTO */}
      <section className="relative min-h-[75vh] md:h-[80vh] w-full flex items-center justify-center pt-24 md:pt-0">
        {/* Camada de Fundo Dinâmica */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={bgIndex}
              initial={{ opacity: 0, scale: 1.3 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="absolute inset-0 bg-neutral-900"
              style={{ transform: 'translateZ(0)', willChange: 'transform, opacity' }}
            >
              <img 
                src={bgImages[bgIndex]} 
                alt="Background Context" 
                className="w-full h-full object-cover brightness-[0.4] dark:brightness-[0.45]"
                loading="eager"
              />
            </motion.div>
          </AnimatePresence>
          {/* Overlay Mist e Gradiente Ultra-Suave — Baixado para focar na fronteira */}
          <div className="absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-black/20 dark:bg-black/10 z-[5]" />
        </div>

        {/* Conteúdo Central */}
        <div className="relative z-20 w-full max-w-7xl px-6 md:px-10 flex flex-col items-center text-center py-12 md:py-20 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ transform: 'translateZ(0)', willChange: 'transform, opacity' }}
            className="space-y-6 md:w-[912px] mx-auto"
          >
            <h2 className="text-white text-[10px] md:text-[12px] font-bold uppercase tracking-[0.6em] opacity-80 drop-shadow-md">SISTEMA OPERACIONAL PESSOAL</h2>
            <h1 className="text-white text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] drop-shadow-2xl">
              Douglas, <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-indigo-400">sua vida em foco.</span>
            </h1>
            
            <div className="h-16 md:h-20 flex items-center justify-center overflow-visible mt-4">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="text-white/90 text-sm md:text-lg font-medium max-w-xl md:w-[614px] md:px-0 drop-shadow-lg py-2 mx-auto"
                >
                  {MOCK_PHRASES[phraseIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

      </section>

      {/* CONTEÚDO PRINCIPAL — MONITORAMENTO PROFUNDO */}
      <div className="space-y-10 pb-20 px-4 pt-4 sm:px-10 relative z-20">
        
        {/* PISTA EXISTENCIAL */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-7xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex items-center justify-between shadow-2xl"
        >
            <div>
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-white/60">Sua Pista Existencial</h3>
              <p className="text-4xl md:text-5xl font-black text-white mt-1">{existentialInsight.runwayMonths} <span className="text-lg text-white/50 font-normal">Meses</span></p>
              <p className="text-xs text-white/40 mt-1">Sustento automático da Programação Existencial</p>
            </div>
            <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-widest text-indigo-400">Fluxo Evolutivo</div>
                <div className="text-3xl font-black text-white">{Math.round(existentialInsight.evolutionRatio * 100)}%</div>
            </div>
        </motion.div>

        {/* CAMADA DE ANÁLISE PROFUNDA — EXPLORAÇÃO MULTI-CAMADAS */}
        <div className="pt-0">


        {/* NAVEGAÇÃO HORIZONTAL DE ABAS */}
        <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar scroll-smooth">
          {Object.keys(dashboardDeepData).map((tab) => {
            const meta = TAB_METADATA[tab] || { label: tab, icon: Clock, desc: "" };
            const IconComponent = meta.icon;
            const isActive = activeDeepTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  try {
                    if (navigator.vibrate) navigator.vibrate(5);
                  } catch (e) {}
                  setActiveDeepTab(tab);
                }}
                className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-2xl text-left transition-all duration-300 border ${
                  isActive 
                  ? "bg-[var(--text)] text-[var(--bg)] border-[var(--text)] shadow-xl scale-[1.02]" 
                  : "bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:border-[var(--muted)] hover:bg-[var(--bg)]/10"
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${isActive ? "bg-[var(--bg)] text-[var(--text)]" : "bg-[var(--bg)]/80"}`}>
                  <IconComponent size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] leading-tight">
                    {meta.label}
                  </p>
                  {meta.desc && (
                    <p className={`text-[8px] font-bold uppercase tracking-wider ${isActive ? "opacity-60 text-[var(--bg)]" : "text-[var(--muted)]"}`}>
                      {meta.desc}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* PAINEL DE CONTEÚDO DA ABA ATIVA — NÍVEL ELITE */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDeepTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-8 md:p-12 shadow-xl overflow-hidden relative"
            >
              {activeDeepTab === 'diario' ? (
                /* PAINEL ESPECIAL DO DIÁRIO - 10 CONTAINERS DE INTELIGÊNCIA EXCLUSIVA */
                <div className="space-y-12 relative z-10 animate-fade-in text-[var(--text)]">
                  
                  {/* TOP BANNER COM SUB-INFO */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[var(--border)]/60">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono font-black uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full tracking-widest">
                          DECA-INTELLIGENCE // V0.8
                        </span>
                      </div>
                      <h4 className="text-3xl md:text-4xl font-black text-[var(--text)] tracking-tighter uppercase leading-none mt-2">
                        Organismo Integrado do Diário
                      </h4>
                      <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mt-2 leading-relaxed">
                        Dez dimensões de cognição, vitalidade e autoconhecimento longitudinal unificados
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-2 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 font-mono">
                          {dashboardDeepData.diario.mainMetric}
                        </span>
                      </div>
                      <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 font-mono">
                          {dashboardDeepData.diario.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* GRID DOS 10 BLOCOS DE DIÁRIO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* 1. Dia e Horário de Início */}
                    <div className="bg-gradient-to-br from-[var(--bg)]/80 to-[var(--bg)]/90 border border-[var(--border)] border-l-4 border-l-indigo-500 rounded-[2rem] p-6 hover:shadow-2xl hover:scale-[1.01] hover:border-indigo-500/40 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full space-y-6">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] font-mono font-black uppercase text-indigo-400 tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-md">
                            DIM-01 // CRONOBIOLOGIA
                          </span>
                          <Clock size={16} className="text-indigo-400 opacity-60" />
                        </div>
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">MÉDIA DESPERTAR</p>
                        <h5 className="text-3xl font-black text-[var(--text)] tracking-tight font-mono mt-1">
                          {dashboardDeepData.diario.blocks.waking.value}
                        </h5>
                        <p className="text-[11px] leading-relaxed text-[var(--muted)] mt-3 italic font-medium">
                          "{dashboardDeepData.diario.blocks.waking.conclusion}"
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[var(--border)]/10 flex justify-between items-center text-[10px] font-bold text-[var(--muted)]">
                        <span>ÚLTIMO REGISTRO:</span>
                        <span className="text-[var(--text)] font-black font-mono bg-[var(--surface)] px-2.5 py-1 rounded-md border border-[var(--border)]">
                          {dashboardDeepData.diario.blocks.waking.latest}
                        </span>
                      </div>
                    </div>

                    {/* 2. Descanso Corporal */}
                    <div className="bg-gradient-to-br from-[var(--bg)]/80 to-[var(--bg)]/90 border border-[var(--border)] border-l-4 border-l-purple-500 rounded-[2rem] p-6 hover:shadow-2xl hover:scale-[1.01] hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full space-y-6">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] font-mono font-black uppercase text-purple-400 tracking-wider bg-purple-500/10 px-2.5 py-1 rounded-md">
                            DIM-02 // ONIRO-LOG
                          </span>
                          <Heart size={16} className="text-purple-400 opacity-60" />
                        </div>
                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono">
                          {dashboardDeepData.diario.blocks.dreams.lucidity}
                        </p>
                        <h5 className="text-[13px] font-black text-[var(--text)] leading-tight mt-1">
                          Símbolos Estáveis: {dashboardDeepData.diario.blocks.dreams.symbols}
                        </h5>
                        <p className="text-[11px] leading-relaxed text-[var(--muted)] mt-3 italic font-medium">
                          "{dashboardDeepData.diario.blocks.dreams.parapsychism}"
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[var(--border)]/10 text-[10px] font-black text-purple-400 uppercase tracking-widest">
                        ➔ {dashboardDeepData.diario.blocks.dreams.frequency}
                      </div>
                    </div>

                    {/* 3. Ações do Dia */}
                    <div className="bg-gradient-to-br from-[var(--bg)]/80 to-[var(--bg)]/90 border border-[var(--border)] border-l-4 border-l-emerald-500 rounded-[2rem] p-6 hover:shadow-2xl hover:scale-[1.01] hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full space-y-6">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] font-mono font-black uppercase text-emerald-400 tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-md">
                            DIM-03 // METAS-AÇÃO
                          </span>
                          <CheckCircle size={16} className="text-emerald-400 opacity-60" />
                        </div>
                        <h5 className="text-xl font-black text-[var(--text)] leading-tight font-mono mb-2">
                          Taxa Sucesso: {dashboardDeepData.diario.blocks.actions.rate}
                        </h5>
                        <div className="space-y-1.5 py-1">
                          <p className="text-[11px] text-[var(--text)] opacity-80 flex items-center gap-1.5 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {dashboardDeepData.diario.blocks.actions.completedTasks}
                          </p>
                          <p className="text-[11px] text-[var(--text)] opacity-80 flex items-center gap-1.5 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            {dashboardDeepData.diario.blocks.actions.doingTasks}
                          </p>
                        </div>
                        <p className="text-[11px] leading-relaxed text-[var(--muted)] mt-3 italic font-medium">
                          "{dashboardDeepData.diario.blocks.actions.conclusion}"
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[var(--border)]/10 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                        Fluxo operacional estável
                      </div>
                    </div>

                    {/* 4. Novidades do Período */}
                    <div className="bg-gradient-to-br from-[var(--bg)]/80 to-[var(--bg)]/90 border border-[var(--border)] border-l-4 border-l-cyan-500 rounded-[2rem] p-6 hover:shadow-2xl hover:scale-[1.01] hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full space-y-6">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] font-mono font-black uppercase text-cyan-400 tracking-wider bg-cyan-500/10 px-2.5 py-1 rounded-md">
                            DIM-04 // ESCALA-TEMPO
                          </span>
                          <Zap size={16} className="text-cyan-400 opacity-60" />
                        </div>
                        <h5 className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">DIÁRIA:</h5>
                        <p className="text-[11px] text-[var(--text)] font-semibold leading-relaxed mt-1">
                          {dashboardDeepData.diario.blocks.novelty.daily}
                        </p>
                        <h5 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-3">SEMANAL:</h5>
                        <p className="text-[11px] text-[var(--muted)] leading-relaxed mt-1 border-l-2 border-cyan-500/30 pl-2">
                          {dashboardDeepData.diario.blocks.novelty.weekly}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[var(--border)]/10 text-[9px] text-[var(--muted)] tracking-tight uppercase font-black leading-tight">
                        Histórico Retrospectivo: {dashboardDeepData.diario.blocks.novelty.longterm}
                      </div>
                    </div>

                    {/* 5. Insights Diários */}
                    <div className="bg-gradient-to-br from-[var(--bg)]/80 to-[var(--bg)]/90 border border-[var(--border)] border-l-4 border-l-amber-500 rounded-[2rem] p-6 hover:shadow-2xl hover:scale-[1.01] hover:border-amber-500/40 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full space-y-6">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] font-mono font-black uppercase text-amber-500 tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-md">
                            DIM-05 // CON-INSIGHT
                          </span>
                          <Sparkles size={16} className="text-amber-500 opacity-60" />
                        </div>
                        <h5 className="text-[13px] font-black text-[var(--text)] leading-snug">
                          {dashboardDeepData.diario.blocks.insights.text}
                        </h5>
                        <p className="text-[11px] leading-relaxed text-[var(--muted)] mt-3 italic font-medium">
                          "{dashboardDeepData.diario.blocks.insights.correlation}"
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[var(--border)]/10 flex justify-between items-center text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                        <span>Reforço Construtivo Ativo</span>
                        <ShieldCheck size={14} className="text-amber-500" />
                      </div>
                    </div>

                    {/* 6. Escrita Livre */}
                    <div className="bg-gradient-to-br from-[var(--bg)]/80 to-[var(--bg)]/90 border border-[var(--border)] border-l-4 border-l-pink-500 rounded-[2rem] p-6 hover:shadow-2xl hover:scale-[1.01] hover:border-pink-500/40 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full space-y-6">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] font-mono font-black uppercase text-pink-400 tracking-wider bg-pink-500/10 px-2.5 py-1 rounded-md">
                            DIM-06 // NEURO-LÍNGUA
                          </span>
                          <BookOpen size={16} className="text-pink-400 opacity-60" />
                        </div>
                        <p className="text-[10px] font-black text-pink-400 uppercase tracking-wider">VOLUME ESCRITO</p>
                        <h5 className="text-3xl font-black text-[var(--text)] tracking-tight font-mono mt-1">
                          {dashboardDeepData.diario.blocks.freewriting.wordCount}
                        </h5>
                        <p className="text-[11px] leading-relaxed text-[var(--muted)] mt-3">
                          {dashboardDeepData.diario.blocks.freewriting.status}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[var(--border)]/10 text-[10px] font-black text-pink-500 uppercase tracking-widest leading-snug italic line-clamp-1">
                        ➔ {dashboardDeepData.diario.blocks.freewriting.recommendation}
                      </div>
                    </div>

                    {/* 7. Estado do Dia */}
                    <div className="bg-gradient-to-br from-[var(--bg)]/80 to-[var(--bg)]/90 border border-[var(--border)] border-l-4 border-l-orange-500 rounded-[2rem] p-6 hover:shadow-2xl hover:scale-[1.01] hover:border-orange-500/40 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full space-y-6">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] font-mono font-black uppercase text-orange-500 tracking-wider bg-orange-500/10 px-2.5 py-1 rounded-md">
                            DIM-07 // VITALIDADE
                          </span>
                          <Sliders size={16} className="text-orange-400 opacity-60" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-1">
                          <div className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-center shadow-sm">
                            <span className="text-[14px] text-orange-400">☯</span>
                            <p className="text-[8px] font-bold text-[var(--muted)] uppercase pt-1">Calma</p>
                            <p className="text-xs font-black text-[var(--text)] font-mono">{dashboardDeepData.diario.blocks.state.calm}</p>
                          </div>
                          <div className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-center shadow-sm">
                            <span className="text-[14px] text-orange-400">⚡</span>
                            <p className="text-[8px] font-bold text-[var(--muted)] uppercase pt-1">Vital</p>
                            <p className="text-xs font-black text-[var(--text)] font-mono">{dashboardDeepData.diario.blocks.state.lucidity}</p>
                          </div>
                          <div className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-center shadow-sm">
                            <span className="text-[14px] text-orange-400">☺</span>
                            <p className="text-[8px] font-bold text-[var(--muted)] uppercase pt-1">Humor</p>
                            <p className="text-xs font-black text-[var(--text)] font-mono">{dashboardDeepData.diario.blocks.state.humor}</p>
                          </div>
                        </div>
                        <p className="text-[11px] leading-relaxed text-[var(--muted)] mt-3 italic font-medium">
                          Síntese: "{dashboardDeepData.diario.blocks.state.conclusion}"
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[var(--border)]/10 text-[10px] text-orange-400 font-bold uppercase tracking-widest">
                        Coerência Cardíaca Excelente
                      </div>
                    </div>

                    {/* 8. Direcionamento da Amparadora */}
                    <div className="bg-gradient-to-br from-[var(--bg)]/80 to-[var(--bg)]/90 border border-[var(--border)] border-l-4 border-l-teal-500 rounded-[2rem] p-6 hover:shadow-2xl hover:scale-[1.01] hover:border-teal-500/40 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full space-y-6">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] font-mono font-black uppercase text-teal-400 tracking-wider bg-teal-500/10 px-2.5 py-1 rounded-md">
                            DIM-08 // SINC-AMPARO
                          </span>
                          <Shield size={16} className="text-teal-400 opacity-60" />
                        </div>
                        <p className="text-[11px] text-[var(--text)] opacity-95 leading-relaxed font-semibold italic">
                          "{dashboardDeepData.diario.blocks.guidance.alignment}"
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[var(--border)]/10 text-[10px] text-teal-400 font-black italic leading-normal">
                        ➔ {dashboardDeepData.diario.blocks.guidance.effect}
                      </div>
                    </div>

                    {/* 9. Ações da Manhã */}
                    <div className="bg-gradient-to-br from-[var(--bg)]/80 to-[var(--bg)]/90 border border-[var(--border)] border-l-4 border-l-amber-400 rounded-[2rem] p-6 hover:shadow-2xl hover:scale-[1.01] hover:border-amber-400/40 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full space-y-6">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] font-mono font-black uppercase text-amber-500 tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-md">
                            DIM-09 // BLIND-SEN
                          </span>
                          <Zap size={16} className="text-amber-400 opacity-60" />
                        </div>
                        <h5 className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">ROTINA E ISOLAMENTO:</h5>
                        <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                          {dashboardDeepData.diario.blocks.morning.routine}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[var(--border)]/10 text-[10px] text-amber-500 font-black uppercase tracking-wider">
                        PREPARAÇÃO: {dashboardDeepData.diario.blocks.morning.prep}
                      </div>
                    </div>

                    {/* 10. Consolidação do Dia */}
                    <div className="bg-gradient-to-br from-[var(--bg)]/80 to-[var(--bg)]/90 border border-[var(--border)] border-l-4 border-l-slate-400 rounded-[2rem] p-6 hover:shadow-2xl hover:scale-[1.01] hover:border-slate-400/40 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full space-y-6">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] font-mono font-black uppercase text-slate-400 tracking-wider bg-slate-500/10 px-2.5 py-1 rounded-md">
                            DIM-10 // CELL-CLOSE
                          </span>
                          <Lock size={16} className="text-slate-400 opacity-60" />
                        </div>
                        <h5 className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">RITMO BIOLÓGICO:</h5>
                        <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                          {dashboardDeepData.diario.blocks.consolidation.sentiment}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[var(--border)]/10 text-[10px] text-[var(--text)] opacity-80 font-bold flex justify-between items-center">
                        <span>FECHAMENTO MÉDIO:</span>
                        <span className="font-mono bg-[var(--surface)] border border-[var(--border)] px-2.5 py-0.5 rounded-md text-[10px]">
                          {dashboardDeepData.diario.blocks.consolidation.closing}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* BOTTOM RECOLHER/EXPANDIR CONTROLS */}
                  <div className="pt-8 border-t border-[var(--border)]/60 flex items-center justify-between">
                    <button 
                      onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                      className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text)] opacity-40 hover:opacity-100 transition-all flex items-center gap-4 group"
                    >
                       {isAnalysisExpanded ? 'Recolher análise estratégica profunda' : 'Explorar análise técnica profunda'}
                       <motion.span 
                         animate={{ rotate: isAnalysisExpanded ? 180 : 0 }}
                         className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:bg-[var(--text)] group-hover:text-[var(--bg)] transition-all"
                       >
                         <ChevronRight size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                       </motion.span>
                    </button>
                    
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                       <span className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">CONEXÃO SÍNCRONA LOCAL</span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                
                {/* Lado Esquerdo: Headline e Ação */}
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]/60">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-5xl md:text-7xl font-black text-[var(--text)] tracking-tighter leading-none font-sans">
                          {dashboardDeepData[activeDeepTab].mainMetric}
                        </h3>
                        <span className={`px-3 py-1 rounded-[10px] text-[9px] font-black uppercase tracking-widest ${
                          dashboardDeepData[activeDeepTab].status === 'saudável' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          dashboardDeepData[activeDeepTab].status === 'atenção' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}>
                          {dashboardDeepData[activeDeepTab].status}
                        </span>
                      </div>
                      <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-2 mt-2">
                        {dashboardDeepData[activeDeepTab].subLabel} 
                        <span className="opacity-30">—</span> 
                        <span className="text-[var(--text)]">{dashboardDeepData[activeDeepTab].interpretation}</span>
                      </p>
                    </div>
                    
                    {/* MINI SPARKLINE */}
                    <div className="w-28 h-14 bg-[var(--bg)]/50 border border-[var(--border)] rounded-2xl p-2.5 flex items-end gap-1.5 self-start sm:self-center">
                      {dashboardDeepData[activeDeepTab].trend.map((val: number, idx: number) => (
                        <div 
                          key={idx} 
                          className={`flex-1 bg-indigo-400 rounded-t-md opacity-${20 + (idx * 10)} transition-all duration-500`}
                          style={{ height: `${val}%`, minHeight: '15%' }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* CAMADA DE INSIGHT E ACÃO */}
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-br from-[var(--bg)]/40 to-[var(--bg)]/60 border border-[var(--border)] rounded-[2rem] relative group border-l-4 border-l-indigo-500 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                          <Sparkles size={14} className="text-indigo-400" /> Insight Estratégico
                        </div>
                        <span className="text-[8px] font-mono opacity-30">TRACK-INSIGHT // L2</span>
                      </div>
                      <p className="text-sm md:text-base font-medium text-[var(--text)] leading-relaxed italic mb-4">
                        "{dashboardDeepData[activeDeepTab].insight}"
                      </p>
                      
                      <div className="pt-4 border-t border-[var(--border)]/40">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] mb-2">Ação Recomendada</p>
                        <p className="text-xs md:text-sm font-bold text-[var(--text)] flex items-start gap-2">
                          <span className="text-indigo-500 mt-0.5">➔</span>
                          <span>{dashboardDeepData[activeDeepTab].action}</span>
                        </p>
                      </div>
                    </div>

                    {/* CROSS DATA INSIGHT */}
                    <div className="inline-flex items-center gap-3.5 px-5 py-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl w-full">
                       <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                         <Activity size={15} />
                       </div>
                       <p className="text-[11px] md:text-xs font-bold text-indigo-400/90 leading-normal">
                         {dashboardDeepData[activeDeepTab].crossInsight}
                       </p>
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Contexto e Métricas Secundárias */}
                <div className="space-y-8 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-widest block mb-1">VISÃO GERAL DO QUADRANTE</span>
                    <h4 className="text-xl md:text-2xl font-black text-[var(--text)] tracking-tight uppercase italic mb-3">
                      {dashboardDeepData[activeDeepTab].title}
                    </h4>
                    <p className="text-[var(--text)] opacity-70 leading-relaxed font-semibold text-xs md:text-sm">
                      {dashboardDeepData[activeDeepTab].summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                    {dashboardDeepData[activeDeepTab].metrics.map((m: any, idx: number) => (
                      <div key={idx} className="space-y-2 p-5 bg-gradient-to-br from-[var(--bg)]/30 to-[var(--bg)]/50 border border-[var(--border)] rounded-2xl hover:border-indigo-500/20 transition-all duration-300 shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--muted)] leading-tight">{m.label}</p>
                        <p className="text-2xl font-black text-[var(--text)] tracking-tight font-mono leading-none">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-[var(--border)]/60 flex items-center justify-between">
                    <button 
                      onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                      className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text)] opacity-40 hover:opacity-100 transition-all flex items-center gap-4 group"
                    >
                       {isAnalysisExpanded ? 'Recolher análise estratégica' : 'Explorar análise técnica completa'}
                       <motion.span 
                         animate={{ rotate: isAnalysisExpanded ? 180 : 0 }}
                         className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:bg-[var(--text)] group-hover:text-[var(--bg)] transition-all"
                       >
                         <ChevronRight size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                       </motion.span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">TEMPO REAL DE PROCESSAMENTO</span>
                    </div>
                  </div>
                </div>

              </div>)}

              {/* CAMADA EXPANSÍVEL — ANÁLISE TÉCNICA PROFUNDA */}
              <AnimatePresence>
                {isAnalysisExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-16 pt-16 border-t border-[var(--border)]">
                      {/* CAMADA DE INTELIGÊNCIA OPERACIONAL (L3) */}
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12">
                        
                        {/* COLUNA ESQUERDA: DIAGNÓSTICO E BLOQUEIOS (8 COLUNAS) */}
                        <div className="xl:col-span-8 space-y-12">
                          
                          {/* 1. DIAGNÓSTICO PROFUNDO */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] opacity-30" />
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">🧠 Diagnóstico Profundo</h4>
                            </div>
                            <p className="text-lg md:text-xl font-bold text-[var(--text)] leading-relaxed italic opacity-90">
                              "{expandedAnalysisData[activeDeepTab]?.diagnosticoProfundo || "Sincronizando diagnóstico..."}"
                            </p>
                          </div>

                          {/* 2. O QUE ESTÁ TE ATRASANDO + MUDANÇA RECENTE */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-amber-500/50" />
                                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">⚠️ Atrasando você hoje</h4>
                              </div>
                              <ul className="space-y-3">
                                {expandedAnalysisData[activeDeepTab]?.atrasoHoje?.map((item: string, i: number) => (
                                  <li key={i} className="flex items-start gap-3">
                                    <span className="text-[10px] font-black text-amber-500 opacity-40 mt-1">/</span>
                                    <p className="text-sm font-bold text-[var(--text)] opacity-80">{item}</p>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-6">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">📊 Mudanço nos últimos dias</h4>
                              </div>
                              <div className="p-5 bg-[var(--bg)] border border-[var(--border)] rounded-3xl">
                                <div className="flex items-end gap-1 h-10 mb-4">
                                  {expandedAnalysisData[activeDeepTab]?.mudancaRecente?.data.map((val: number, i: number) => (
                                    <div key={i} className="flex-1 bg-[var(--text)] opacity-10 rounded-t-sm" style={{ height: `${val}%` }} />
                                  ))}
                                </div>
                                <p className="text-[11px] font-bold text-[var(--text)] leading-relaxed italic opacity-80">
                                  "{expandedAnalysisData[activeDeepTab]?.mudancaRecente?.interpretation}"
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 3. PROJEÇÃO E IMPACTO NOS OBJETIVOS */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-8 border-t border-[var(--border)]">
                            <div className="space-y-3">
                              <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">🔮 Se você continuar assim</h4>
                              <p className="text-sm font-bold text-[var(--text)] leading-relaxed italic">
                                "{expandedAnalysisData[activeDeepTab]?.seContinuarAssim}"
                              </p>
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-500/70">🎯 Impacto nos Objetivos</h4>
                              <p className="text-sm font-black text-[var(--text)] leading-tight tracking-tight uppercase italic">
                                {expandedAnalysisData[activeDeepTab]?.impactoObjetivos}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* COLUNA DIREITA: PROTOCOLO OPERACIONAL (4 COLUNAS) */}
                        <div className="xl:col-span-4 translate-y-1">
                          <div className="p-6 sm:p-8 bg-[var(--text)] text-[var(--bg)] rounded-[2rem] sm:rounded-[3rem] shadow-2xl h-full flex flex-col">
                            <div className="flex items-center gap-2 mb-8">
                               <div className="w-2 h-2 rounded-full bg-[var(--bg)] opacity-30" />
                               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">⚙️ O que fazer agora</h4>
                            </div>

                            <div className="space-y-8 flex-1">
                              {expandedAnalysisData[activeDeepTab]?.oQueFazerAgora?.map((step: any, i: number) => (
                                <div key={i} className="space-y-2">
                                   <div className="flex justify-between items-start">
                                      <p className="text-[15px] font-black tracking-tight leading-none uppercase italic">{step.task}</p>
                                      <span className="text-[9px] font-black uppercase opacity-40 ml-4 whitespace-nowrap">{step.when}</span>
                                   </div>
                                   <p className="text-[10px] font-bold opacity-60 leading-relaxed italic">→ Por que: {step.why}</p>
                                </div>
                              ))}
                            </div>

                            <div className="mt-12 pt-8 border-t border-[var(--bg)]/10">
                               {activeDeepTab === 'financeiro' && (
                                 <button 
                                   onClick={() => navigate('/cortes')}
                                   className="w-full mb-8 py-4 bg-[var(--bg)] text-[var(--text)] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                 >
                                   <Scissors size={14} className="text-[var(--text)]" />
                                   Executar Auditoria de Cortes
                                 </button>
                               )}
                               <h4 className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 mb-3">🚀 O que você ganha se fizer</h4>
                               <p className="text-[13px] font-black tracking-tight leading-tight italic">
                                 "{expandedAnalysisData[activeDeepTab]?.resultadoEsperado}"
                               </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Footer de Auditoria Técnica */}
                      <div className="mt-16 pt-12 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-6">
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center">
                             <ShieldCheck size={18} className="text-[var(--text)] opacity-40" />
                           </div>
                           <div>
                             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text)]">Auditoria de Dados</p>
                             <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-[0.1em]">Integridade: 99.9% — Semântica: Vativa</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] opacity-50">v0.8.4-ALPHA</span>
                            <button 
                              onClick={() => setIsAnalysisExpanded(false)}
                              className="px-6 py-3 border border-[var(--border)] text-[var(--text)] text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all"
                            >
                              Encerrar Relatório
                            </button>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Marca D'água de fundo */}
              <div className="absolute -bottom-10 -right-10 text-[12rem] font-black text-[var(--text)] opacity-[0.02] pointer-events-none select-none uppercase italic">
                {activeDeepTab}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  </div>
);
}

