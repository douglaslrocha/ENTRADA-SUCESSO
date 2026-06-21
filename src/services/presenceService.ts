
export interface Company {
  id: string;
  name: string;
  role: string;
  period: string;
  description: string;
  website: string;
}

export interface Connection {
  id: string;
  type: 'Phone' | 'WhatsApp' | 'Instagram' | 'Website' | 'LinkedIn' | 'YouTube' | 'Facebook' | 'Email' | 'Instituição' | 'Endereço' | 'Localização' | 'Personalizado';
  value: string;
}

export interface ReferenceContent {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'podcast' | 'interview' | 'article' | 'book';
}

export interface AssociateReference {
  id: string;
  title: string;
  subtitle: string;
  icon?: string;
  type: 'book' | 'idea' | 'philosophy';
}

export interface HumanTrait {
  id: string;
  label: string;
  image?: string; 
}

export interface Project {
  id: string;
  name: string;
  year: string;
  url?: string;
  description?: string;
}

export interface HumanValueNotes {
  goodFor: string;
  goodForImage?: string;
  evolutionImpact: string;
  evolutionImpactImage?: string;
  specialTraits: string;
  specialTraitsImage?: string;
  situationalValue: string;
  situationalValueImage?: string;
  positiveAwakening: string;
  positiveAwakeningImage?: string;
  direction: string;
  directionImage?: string;
  thoughtExpansion: string;
  thoughtExpansionImage?: string;
  perceptionChange: string;
  perceptionChangeImage?: string;
}

export interface Presence {
  id: string;
  name: string;
  photo: string;
  city?: string;
  country?: string;
  age?: string;
  profession?: string;
  visitedCountries?: string;
  
  // Cognitive Influence Structure (MÓDULO: PRESENÇAS — MOTOR DE INFLUÊNCIA EXISTENCIAL)
  influencia?: string; // quais áreas ativa
  acionar_quando?: string; // situações específicas
  dna?: string; // princípios centrais
  impacto?: string; // como altera a vida do usuário
  alerta?: string; // traços de risco de absorção
  peso?: number; // importância subjetiva (0-10)
  
  secondaryImages?: string[];
  mainVideos?: string[]; 
  
  companies?: Company[];
  projects?: Project[];
  
  connections?: Connection[];
  
  essentials?: {
    representation: string;
    representationImage?: string;
    impact: string;
    impactImage?: string;
    learning: string;
    learningImage?: string;
    awakening: string;
    awakeningImage?: string;
    influence: string;
    influenceImage?: string;
  };
  
  characteristics?: HumanTrait[]; 
  quotes?: { id: string; text: string; context?: string }[];
  sensations?: HumanTrait[]; 
  humanNotes?: HumanValueNotes;
  
  livingGallery?: string[];
  livingContent?: ReferenceContent[];
  associatedReferences?: AssociateReference[];
  freeNotes?: string;

  role?: string;
  bio?: string;
  images?: string[];
  thoughts?: string[];
  references?: { title: string; url: string; type: 'video' | 'article' | 'social' }[];
  createdAt?: string;
}

const presences: Presence[] = [
  {
    id: '1',
    name: 'Dr. Andrew Huberman',
    photo: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60',
    city: 'Stanford, CA',
    country: 'USA',
    age: '48',
    profession: 'Neurocientista & Professor',
    visitedCountries: 'Brasil, Japão, Alemanha, Reino Unido',
    influencia: 'Foco profundo, biologia do comportamento, otimização do sono, hábitos diários, desempenho mental e físico.',
    acionar_quando: 'Bloqueio de foco, rotinas matinais desreguladas, cansaço físico inexplicado ou estagnação biológica.',
    dna: 'Rigor científico empírico, testagem ativa baseada em dados e protocolos de causa-efeito altamente previsíveis.',
    impacto: 'Instaura uma disciplina biológica diária saudável e desenvolve o respeito focado pela máquina física.',
    alerta: 'Evitar perfeccionismo excessivo obsessivo ou tentar otimizar cada segundo ruidosamente.',
    peso: 8.5,
    essentials: {
      representation: 'A ponte entre a ciência rigorosa e a aplicação prática na vida humana.',
      representationImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800',
      impact: 'Democratizou o acesso a protocolos de saúde mental e performance física.',
      impactImage: 'https://images.unsplash.com/photo-1532187875605-7fe35937ee5d?w=800',
      learning: 'A biologia é uma ferramenta que podemos aprender a operar.',
      learningImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      awakening: 'A curiosidade disciplinada sobre como nosso corpo funciona.',
      awakeningImage: 'https://images.unsplash.com/photo-1505751172107-167232230a10?w=800',
      influence: 'Mudou minha rotina matinal e minha relação com a luz e o sono.',
      influenceImage: 'https://images.unsplash.com/photo-1445510491599-c391e8046a68?w=800'
    },
    humanNotes: {
      goodFor: 'Tradução de complexidade biológica em protocolos práticos de vida.',
      goodForImage: 'https://images.unsplash.com/photo-1532187875605-7fe35937ee5d?w=800',
      evolutionImpact: 'Acelera minha compreensão de que o corpo é um sistema hackeável.',
      evolutionImpactImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800',
      specialTraits: 'A habilidade de manter o rigor científico sem perder a conexão humana.',
      specialTraitsImage: 'https://images.unsplash.com/photo-1532187875605-7fe35937ee5d?w=800',
      situationalValue: 'Quando me sinto estagnado biologicamente ou mentalmente.',
      situationalValueImage: 'https://images.unsplash.com/photo-1445510491599-c391e8046a68?w=800',
      positiveAwakening: 'Desperta em mim a vontade de cuidar da máquina biológica com respeito.',
      direction: 'Traz clareza sobre o que é ruído e o que é sinal na saúde humana.',
      thoughtExpansion: 'Expande minha visão sobre a plasticidade do cérebro e do comportamento.',
      perceptionChange: 'Fez-me ver o sono e a luz não como detalhes, mas como pilares da existência.'
    },
    characteristics: [
      { id: 't1', label: 'Rigor Científico', image: 'https://images.unsplash.com/photo-1532187875605-7fe35937ee5d?w=200' },
      { id: 't2', label: 'Clareza Didática', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200' }
    ],
    quotes: [
      { id: 'q1', text: 'Sua visão é um dos sentidos mais poderosos para modular seu estado interno.', context: 'Huberman Lab Podcast' }
    ],
    connections: [
      { id: 'c1', type: 'YouTube', value: '@hubermanlab' },
      { id: 'c2', type: 'Website', value: 'hubermanlab.com' }
    ],
    livingGallery: [
      'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400',
      'https://images.unsplash.com/photo-1579389083078-4e7018379f7e?w=400'
    ],
    associatedReferences: [
      { id: 'ref1', title: 'On the Origin of Species', subtitle: 'A base da compreensão sobre a evolução e adaptação biológica.', icon: 'child_care', type: 'book' },
      { id: 'ref2', title: 'Neuroplasticidade Ativa', subtitle: 'A ideia de que o cérebro pode se remodelar através do esforço focado.', icon: 'psychology', type: 'idea' }
    ]
  },
  {
    id: '2',
    name: 'Naval Ravikant',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=60',
    city: 'Silicon Valley',
    country: 'USA',
    age: '50',
    profession: 'Investidor & Filósofo Moderno',
    influencia: 'Independência material, minimalismo existencial, tranquilidade interior, clareza em julgamentos complexos.',
    acionar_quando: 'Crises existenciais, ruído mental de reputações, dúvidas sobre alavancagem profissional ou ansiedade de status.',
    dna: 'Soberania individual extrema, sabedoria estoica desapegada e predileção por entender primeiros princípios.',
    impacto: 'Direciona ao silenciamento de influências externas ruidosas e estimula a autoanálise pragmática calma.',
    alerta: 'Evitar cinismo excessivo com relações emocionais ordinárias ou distanciamento produtivo excessivo.',
    peso: 9.5,
    essentials: {
      representation: 'A busca pela riqueza e felicidade através da alavancagem individual.',
      impact: 'Redefiniu minha compreensão sobre capital, trabalho e paz interna.',
      learning: 'A leitura é o superpoder definitivo.',
      awakening: 'O desejo de ser livre, não apenas rico.',
      influence: 'Ensinou-me a valorizar o julgamento sobre o esforço bruto.'
    },
    characteristics: [
      { id: 't3', label: 'Sabedoria Estóica', image: 'https://images.unsplash.com/photo-1513506859357-191942a63273?w=200' }
    ],
    quotes: [
      { id: 'q2', text: 'Fique rico sem ter sorte.', context: 'The Almanack of Naval Ravikant' }
    ],
    connections: [
      { id: 'c3', type: 'Instagram', value: '@naval' }
    ]
  },
  {
    id: '3',
    name: 'Nikola Tesla',
    photo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
    city: 'Smiljan',
    country: 'Croácia',
    profession: 'Inventor & Físico Visionário',
    influencia: 'Criatividade radical de canais puros, inovação tecnológica futurista, foco profundo de abstração e intuição refinada.',
    acionar_quando: 'Bloqueios criativos profundos, necessidade de pensar além do ordinário e idealização conceitual inicial de projetos.',
    dna: 'Foco profundo de obsessão inventiva, experimentação irrestrita e visualização espacial impecável integral.',
    impacto: 'Estimula pensamentos inventivos destemidos e expande os horizontes do que é concebido como realizável.',
    alerta: 'Evitar isolamento antissocial completo debilitante e obsessões intransponíveis com ideias impossíveis.',
    peso: 9.3,
    essentials: {
      representation: 'O arquétipo do inventor absoluto que projeta o futuro com obstinação visionária.',
      impact: 'Quebra limites de crenças sociais do seu tempo por meio de puras criações intelectuais.',
      learning: 'Modulação perfeita em nível puramente mental antes da construção física.',
      awakening: 'A percepção fina das energias circundantes universais e leis da física.',
      influence: 'Força impulsora de ousadia inventiva que ignora barreiras mercadológicas banais modernos.'
    },
    characteristics: [
      { id: 't4', label: 'Criatividade Radical', image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=200' },
      { id: 't5', label: 'Idealização teórica', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200' }
    ],
    quotes: [
      { id: 'q3', text: 'O presente é deles; o futuro, pelo qual realmente trabalhei, é meu.', context: 'Minhas Invenções' }
    ],
    connections: [
      { id: 'c4', type: 'Website', value: 'tesla-museum.org' }
    ]
  }
];

let localPresences = [...presences];

export const presenceService = {
  getPresences: () => localPresences,
  getPresence: (id: string) => localPresences.find(p => p.id === id),
  addPresence: (presence: Omit<Presence, 'id'>) => {
    const newPresence = {
      ...presence,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    } as Presence;
    localPresences = [newPresence, ...localPresences];
    return newPresence;
  },
  updatePresence: (id: string, updates: Partial<Presence>) => {
    localPresences = localPresences.map(p => p.id === id ? { ...p, ...updates } : p);
    return localPresences.find(p => p.id === id);
  },
  deletePresence: (id: string) => {
    localPresences = localPresences.filter(p => p.id === id ? false : true);
  }
};
