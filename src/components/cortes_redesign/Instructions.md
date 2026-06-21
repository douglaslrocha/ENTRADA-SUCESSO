# 🚀 Mapeamento de Redesign & Instruções para Inteligência Artificial

Este arquivo contém o **Prompt definitivo** que você deve utilizar para gerar o redesign pixel-perfect da página **Cortes / Finanças** em outra inteligência artificial (como Claude 3.5 Sonnet ou GPT-4o). 

Siga os passos:
1. **Copie todo o Bloco de Prompt** abaixo.
2. **Cole no chat da Inteligência Artificial externa** de sua escolha.
3. Depois que ela retornar o código pronto, **substitua o conteúdo inteiro do arquivo `src/components/cortes_redesign/CortesPageRedesign.tsx` pelo código recebido**.
4. Modifique o arquivo `src/App.tsx` para usar o componente `CortesPage` importando de `./components/cortes_redesign/CortesPageRedesign` em vez de `./components/CortesPage`.

---

## 📝 O PROMPT DEFINITIVO (Copie e cole abaixo)

```markdown
Role: Diretor de Design UI/UX Senior e Especialista em React/TypeScript.

Contexto:
Estou desenvolvendo uma tela financeira avançada altamente sofisticada chamada "Módulo de Cortes" (Finanças Pessoais, Inteligência Existencial, Alquimia de Capital e Análise pelo Gemini 3.5). No entanto, o layout atual ficou visualmente saturado e desorganizado. Preciso que você reconstrua totalmente esta página para que ela fique absolutamente espetacular, elegante, minimalista, moderna e perfeitamente responsiva tanto para Mobile quanto para Desktop.

A interface deve parecer um terminal Bloomberg de altíssimo padrão fundido com um dashboard moderno da Apple ou Vercel. 

Diretrizes de Design Invioláveis:
1. Paleta de Cores & Atmosfera: Fundo escuro absoluto (cinzas ultra-profundos da paleta Zinc-950 / Black), com transparências vitrificadas (glassmorphism), bordas finas sutis (zinc-850/border-white/10) e realces em tons elegantes de Esmeralda (Emerald-400 para receitas e sustentabilidade) e Rosa/Carmesim (Rose-500 para despesas, amortização e saídas).
2. Sem Clutter Visual: Evite linhas de grid desnecessárias, sombras robóticas pesadas ou gradients genéricos. Use espaçamento generoso (padding e margin assimétricos para ritmo visual), tipografia de exibição premium (paridade perfeita entre títulos em sans-serif condensado/negrito e numerais/dados estruturados em mono-espaçado legível do JetBrains Mono).
3. Adaptação Responsiva: Cada painel do bento-grid deve converter-se perfeitamente de colunas colaterais em desktop para carrosséis ou empilhamento vertical suave com gestos táteis em aparelhos móveis.
4. Animações e Transições Magníficas: Use '@motion/react' (ou 'framer-motion') para modular suavidade em cards que se expandem, transições de abas, flutuações, listas ordenáveis e modais fluidos.

---

### ESPECIFICAÇÃO TÉCNICA E REQUISITOS DE CÓDIGO (Não exclua nenhum recurso existente)

O componente exportado DEVE ser exatamente:
export const CortesPage: React.FC<CortesPageProps> = ({ 
  onBack, 
  onToggleSidebar, 
  categories, 
  transactions, 
  onRefreshCategories,
  theme = 'dark',
  onToggleTheme
}) => { ... }

Definição de Tipos e Props:
interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color?: string;
  order?: number;
  // ...outros campos que possam existir
}
interface Transaction {
  id: string;
  category_id: string;
  value: number;
  date: string;
  note?: string;
}
interface CortesPageProps {
  onBack: () => void;
  onToggleSidebar?: () => void;
  categories: Category[];
  transactions: Transaction[];
  onRefreshCategories: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

Os seguintes estados e lógicas complexos devem permanecer funcionando intactos no novo código:

1. Controle de Sub-visões do Painel:
   const [activeSubView, setActiveSubView] = useState<'main' | 'income' | 'expense' | 'categories'>('main');
   const [activeDesktopTab, setActiveDesktopTab] = useState<'prioritaria' | 'dispersao' | 'vontade' | 'transmutations'>('prioritaria');

2. Gerenciador de Custo de Sobrevivência Mensal e Hora de Vida:
   - Custo mensal baseado nas despesas reais ou simulado manualmente por:
     const [manualMonthlySurvivalCost, setManualMonthlySurvivalCost] = useState<number | null>(null);
   - Cálculo do Custo de Vida por Hora de Trabalho / Força Vital (1 h de vida ativa = custo mensal de sobrevivência / 168 horas normais). Exiba com precisão cirúrgica e clareza visual impecável quanto custa cada hora de sua vida em termos materiais ("De vida comprada").

3. Central de Alquimia e Inteligência Financeira (Modo Analista / FIC):
   - Painel expandível operado por:
     const [isAnalystModeOpen, setIsAnalystModeOpen] = useState(false);
     const [activePerspective, setActivePerspective] = useState<'patrimonio' | 'rec_desp' | 'categorias' | 'waterfall' | 'objetivo_vida'>('patrimonio');
     const [selectedForecastScenario, setSelectedForecastScenario] = useState<'realista' | 'otimista' | 'conservadora'>('realista');
     const [zoomDays, setZoomDays] = useState(30);
     const [panOffset, setPanOffset] = useState(0);
   - Gráficos responsivos usando 'recharts' para cada perspectiva (Área, Linhas ou Barras elegantes integrando os dados das transações e categorias).
   - Chatbot integrado ao Gemini (ou simulação de alta fidelidade) operado pelo estado:
     const [ficChatMessages, setFicChatMessages] = useState<Array<{ sender: 'user' | 'system'; text: string }>>([...]);
     const [ficQuestionInput, setFicQuestionInput] = useState('');
     const [ficLoading, setFicLoading] = useState(false);
     As respostas devem processar as transações e dar conselhos analíticos sobre o corte de dispersões, margem de segurança e otimização existencial. Utilize a chamada para a IA ou lógica mockada inteligente de fallback.

4. Gamificação de Força de Vontade e Pista Existencial (Simulação de Gastos):
   - Caixa interativa operada por `simulationAmount` e `futureBuyToast`.
   - Permite que o usuário insira o valor de um item que ele quer comprar supérfluo, e calcula instantaneamente quantas HORAS de sua "Força Vital" (Trabalho Ativo) serão gastas para comprar aquele item. Mostra uma mensagem de impacto de sabedoria financeira clássica.

5. Inteligência Alquímica de Transmutação de Capital:
   - Registro de transmutações onde despesas supérfluas são eliminadas e passadas para Ativos Líquidos.
   - Operado pelos estados:
     const [transmuterSimList, setTransmuterSimList] = useState<Array<{ id: string; name: string; value: number; type: 'expense' | 'asset'; categoryName: string; date: string }>>([]);
     Permita simular novos itens removendo-os e adicionando-os na lista tática, atualizando dinamicamente o fluxo livre gerado.

6. Modais Completos e Formulários de Transações:
   - Modal unificado para gerenciar categorias e lançamentos:
     const [isModalOpen, setIsModalOpen] = useState(false);
     const [modalTab, setModalTab] = useState<'income' | 'expense' | 'categories'>('income');

7. Modo de Edição Financeira Rápida Invisível:
   - Rápido rascunho de edições usando `isEditingFinancialMode`, `editingFinancialDraft`, para fins de alteração sem modificar o banco persistente até confirmação expressa do usuário.

Estrutura Visual Solicitada:
- CABEÇALHO HERO: Título imponente combinando exibição de alta resolução com relógio de sincronização ou indicadores do sistema de tempos.
- GRID BENTO PRINCIPAL: 
  * Card A (Balancete de Tempo e Liberdade): Exposição brilhante da "Força Vital" (R$/h de vida) e custos com tipografia extremamente elegante.
  * Card B (Simulador de Vontade): Input dinâmico e simulação interativa de horas de vida gastas por mercadoria.
  * Card C (Painel Alquímico): Visualização em tempo real de transmutações ativas de gastos para ativos de transmutação com listas ordenáveis e drag & drop opcional usando motion.
- SEÇÃO ANALÍTICA ULTRA MODERN (FIC): Painel de analista Bloomberg integrado que renderiza gráficos limpos na perspectiva escolhida (Patrimônio, Despesas, Waterfall, etc.) e o chat elegante do analista de bolso.
- LISTAGEM GERAL DE TRANSAÇÕES E CATEGORIAS: Com filtros dinâmicos de período (semana, mês, ano) e barra de busca limpa com transições suaves.

Quero um código React limpo, em TypeScript e Tailwind CSS, 100% autossuficiente e livre de erros, combinando todas essas funcionalidades de forma linda e de dar inveja em qualquer designer da Apple! Importe todos os ícones necessários do 'lucide-react' e hooks do 'react'/'motion/react'/'recharts'.
```
