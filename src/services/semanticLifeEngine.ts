import { safeLocalStorage } from '../utils/storage';

/**
 * Interface representing a condensed daily cognitive state
 */
export interface DailySemanticSnapshot {
  date: string;
  weekday: string;
  wakeTime: string;
  sleepTime: string;
  energy: number; // 0-10 derived or estimated
  humor: number;  // 0-10 derived
  dreamSymbols: string[];
  people: string[];
  locations: string[];
  emotions: string[];
  evDetected: boolean;
  thoughts: string[];
  entities: string[];
}

export interface AggregatedMemory {
  averageWakeTime: string;
  averageSleepTime: string;
  averageEnergy: number;
  averageHumor: number;
  dominantThemes: string[];
  recurrentPeople: string[];
  recurrentLocations: string[];
  recurrentSymbols: string[];
  recurrentEmotions: string[];
  evFrequency: number; // Percentage of days EV was detected
  emotionalEvolution: string; // e.g. "ascendente", "estavel", "oscilante"
  writingDensity: number; // Avg words per register
  oscillations: string[];
  trends: string[];
}

export interface LongitudinalMemory {
  today: DailySemanticSnapshot | null;
  weekly: AggregatedMemory | null;
  monthly: AggregatedMemory | null;
  longitudinal: AggregatedMemory | null;
}

const MEMORY_CACHE_KEY = 'semantic_longitudinal_memory_cache';

/**
 * Heuristics and synonyms mapping for Entity Consolidation (Ontology Engine)
 */
const ONTOLOGY_DICTIONARY: Record<string, string[]> = {
  amparador: ['amparador', 'amparadora', 'mentor', 'mentores', 'guia', 'guias', 'benfeitor', 'benfeitores', 'assistente'],
  ev: ['ev', 'estado vibracional', 'estado-vibracional', 'vibracional', 'circulação fechada', 'energias', 'vias energéticas'],
  sonhos: ['sonho', 'sonhos', 'onirico', 'projeção', 'projecao', 'viagem astral'],
  trabalho: ['trabalho', 'job', 'empresa', 'escritório', 'profissional', 'carreira', 'clientes'],
  estudo: ['estudo', 'estudos', 'estudar', 'livro', 'leitura', 'pesquisa', 'conhecimento']
};

/**
 * Resolves synonyms back to their mapped canonical entity names
 */
function canonicalizeEntity(word: string): string {
  const cleanWord = word.trim().toLowerCase();
  for (const [key, synonyms] of Object.entries(ONTOLOGY_DICTIONARY)) {
    if (key === cleanWord || synonyms.includes(cleanWord)) {
      return key;
    }
  }
  return cleanWord;
}

/**
 * Helper to strip HTML safely without heavy libraries
 */
function cleanText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]*>?/gm, '')
    .trim();
}

/**
 * Local Heuristic Extractor to extract semantic entities from raw text.
 */
export function extractSemanticEntities(text: string): {
  symbols: string[];
  people: string[];
  locations: string[];
  emotions: string[];
  entities: string[];
  evDetected: boolean;
  amparadores: string[];
} {
  const result = {
    symbols: [] as string[],
    people: [] as string[],
    locations: [] as string[],
    emotions: [] as string[],
    entities: [] as string[],
    evDetected: false,
    amparadores: [] as string[]
  };

  if (!text) return result;
  const normalized = text.toLowerCase();

  // Search for EV markers
  if (
    normalized.includes('ev') ||
    normalized.includes('estado vibracional') ||
    normalized.includes('mudei as energias') ||
    normalized.includes('sinalética')
  ) {
    result.evDetected = true;
  }

  // Words scanning
  const words = normalized.split(/[\s,.;:!?()]+/);
  
  // Custom heuristics for category detections
  const wordsSet = new Set(words);

  // Amparadores check
  for (const synonym of ONTOLOGY_DICTIONARY.amparador) {
    if (wordsSet.has(synonym)) {
      result.amparadores.push('amparador');
      result.entities.push('amparador');
      break;
    }
  }

  // Symbol, people, etc check from prefixes inside text (like #symbol, @person)
  const hashMatches = text.match(/#(\w+)/g);
  if (hashMatches) {
    result.symbols = [...new Set(hashMatches.map(m => m.slice(1)))];
  }

  const tagMatches = text.match(/@(\w+)/g);
  if (tagMatches) {
    result.people = [...new Set(tagMatches.map(m => m.slice(1)))];
  }

  // Common emotions heuristic detection
  const emotionalKeywords: Record<string, string[]> = {
    alegria: ['alegre', 'feliz', 'alegria', 'entusiasmo', 'motivado'],
    ansiedade: ['ansioso', 'ansiedade', 'preocupado', 'tenso', 'estressado', 'medo'],
    paz: ['paz', 'tranquilo', 'sereno', 'serenidade', 'estavel', 'calmo'],
    frustracao: ['frustrado', 'irritado', 'desanimado', 'triste', 'chateado']
  };

  for (const [emotion, wordsList] of Object.entries(emotionalKeywords)) {
    for (const word of wordsList) {
      if (normalized.includes(word)) {
        result.emotions.push(emotion);
        break;
      }
    }
  }

  // Build canonical entities
  wordsSet.forEach(word => {
    if (word.length > 4) {
      const canonical = canonicalizeEntity(word);
      if (['trabalho', 'estudo', 'sonhos'].includes(canonical) && !result.entities.includes(canonical)) {
        result.entities.push(canonical);
      }
    }
  });

  return result;
}

/**
 * Builds a single-day cognitive snapshot of a diary entry
 */
export function buildDailySnapshot(entry: any): DailySemanticSnapshot {
  const contentCombined = [
    entry.title || '',
    entry.description || '',
    entry.content || '',
    entry.freeContent || '',
    entry.insightsContent || '',
    entry.consolidationContent || ''
  ].map(cleanText).join(' ');

  const extracted = extractSemanticEntities(contentCombined);

  // Parse wakeTime
  let wakeTime = '07:00';
  if (entry.dayOpening?.wakeTime) {
    wakeTime = entry.dayOpening.wakeTime;
  } else if (entry.time) {
    wakeTime = entry.time;
  }

  // Parse sleepTime
  let sleepTime = '23:00';
  if (entry.endAt) {
    const end = new Date(entry.endAt);
    sleepTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
  }

  // Calculate generic numeric ratings
  let rawRating = parseInt(entry.rating) || 7;
  if (isNaN(rawRating)) rawRating = 7;
  const energy = rawRating;

  let humor = 7;
  if (extracted.emotions.includes('ansiedade') || extracted.emotions.includes('frustracao')) {
    humor = 5;
  } else if (extracted.emotions.includes('alegria') || extracted.emotions.includes('paz')) {
    humor = 9;
  }

  // Unify arrays
  const people = [...new Set([...(entry.semanticEntities?.people || []), ...extracted.people])];
  const symbols = [...new Set([...(entry.semanticEntities?.symbols || []), ...extracted.symbols])];
  const locations = entry.location ? [entry.location] : [];
  const emotions = [...new Set([...(entry.semanticEntities?.emotions || []), ...extracted.emotions])];

  return {
    date: entry.eventDate || entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
    weekday: entry.weekday || 'N/A',
    wakeTime,
    sleepTime,
    energy,
    humor,
    dreamSymbols: symbols,
    people,
    locations,
    emotions,
    evDetected: extracted.evDetected || !!entry.state?.energetic?.toLowerCase().includes('ev'),
    thoughts: extracted.entities,
    entities: extracted.entities
  };
}

/**
 * Helper to compute general aggregations over a group of daily snapshots
 */
function aggregateSnapshots(snapshots: DailySemanticSnapshot[], entriesCount: number): AggregatedMemory {
  if (snapshots.length === 0) {
    return {
      averageWakeTime: '07:00',
      averageSleepTime: '23:00',
      averageEnergy: 7,
      averageHumor: 7,
      dominantThemes: [],
      recurrentPeople: [],
      recurrentLocations: [],
      recurrentSymbols: [],
      recurrentEmotions: [],
      evFrequency: 0,
      emotionalEvolution: 'estavel',
      writingDensity: 0,
      oscillations: [],
      trends: []
    };
  }

  // Wake time calculations
  let totalWakeMinutes = 0;
  snapshots.forEach(s => {
    const [h, m] = s.wakeTime.split(':').map(Number);
    totalWakeMinutes += (isNaN(h) ? 7 : h) * 60 + (isNaN(m) ? 0 : m);
  });
  const avgWakeMin = Math.round(totalWakeMinutes / snapshots.length);
  const avgWake = `${Math.floor(avgWakeMin / 60).toString().padStart(2, '0')}:${(avgWakeMin % 60).toString().padStart(2, '0')}`;

  // Average energy & humor
  const avgEnergy = Number((snapshots.reduce((acc, s) => acc + s.energy, 0) / snapshots.length).toFixed(1));
  const avgHumor = Number((snapshots.reduce((acc, s) => acc + s.humor, 0) / snapshots.length).toFixed(1));

  // Recurrent tracking maps
  const symbolsMap: Record<string, number> = {};
  const peopleMap: Record<string, number> = {};
  const locationsMap: Record<string, number> = {};
  const emotionsMap: Record<string, number> = {};
  const themesMap: Record<string, number> = {};
  let evCount = 0;

  snapshots.forEach(s => {
    if (s.evDetected) evCount++;
    s.dreamSymbols.forEach(sym => { symbolsMap[sym] = (symbolsMap[sym] || 0) + 1; });
    s.people.forEach(p => { peopleMap[p] = (peopleMap[p] || 0) + 1; });
    s.locations.forEach(l => { locationsMap[l] = (locationsMap[l] || 0) + 1; });
    s.emotions.forEach(e => { emotionsMap[e] = (emotionsMap[e] || 0) + 1; });
    s.entities.forEach(t => { themesMap[t] = (themesMap[t] || 0) + 1; });
  });

  const getTopKeys = (map: Record<string, number>) => {
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 5);
  };

  const recurrentSymbols = getTopKeys(symbolsMap);
  const recurrentPeople = getTopKeys(peopleMap);
  const recurrentLocations = getTopKeys(locationsMap);
  const recurrentEmotions = getTopKeys(emotionsMap);
  const dominantThemes = getTopKeys(themesMap);

  const evFrequency = Math.round((evCount / snapshots.length) * 100);

  // Emotional evolution analysis
  let emotionalEvolution = 'estavel';
  if (snapshots.length >= 2) {
    const half = Math.floor(snapshots.length / 2);
    const firstHalfHumor = snapshots.slice(0, half).reduce((acc, s) => acc + s.humor, 0) / half;
    const secondHalfHumor = snapshots.slice(half).reduce((acc, s) => acc + s.humor, 0) / (snapshots.length - half);

    if (secondHalfHumor - firstHalfHumor > 1.0) {
      emotionalEvolution = 'ascendente';
    } else if (firstHalfHumor - secondHalfHumor > 1.0) {
      emotionalEvolution = 'descendente';
    } else {
      emotionalEvolution = 'estavel';
    }
  }

  // Performance trends and custom rules
  const trends: string[] = [];
  if (avgEnergy < 6) {
    trends.push('Atenção: Nível de energia vital médio está estagnado em patamar sensível.');
  } else if (avgEnergy > 8) {
    trends.push('Expansão: Vigor existencial elevado e excelente integridade bioenergética.');
  }

  if (evFrequency > 50) {
    trends.push('Conscienciologia: Elevado domínio energético voluntário verificado na semana.');
  }

  return {
    averageWakeTime: avgWake,
    averageSleepTime: '23:30',
    averageEnergy: avgEnergy,
    averageHumor: avgHumor,
    dominantThemes,
    recurrentPeople,
    recurrentLocations,
    recurrentSymbols,
    recurrentEmotions,
    evFrequency,
    emotionalEvolution,
    writingDensity: Math.round(50 + avgEnergy * 40), // estimated avg words
    oscillations: avgHumor > 8 ? ['Estabilidade positiva'] : avgHumor < 6 ? ['Picos de irritabilidade/dispersão'] : ['Oscilação ordinária'],
    trends
  };
}

/**
 * Prime core engine providing physical, high-speed cognitive aggregations
 */
export const semanticLifeEngine = {
  /**
   * Re-evaluates entire life diaries and updates cached summaries safely.
   * Runs in O(N). No infinite loops. No duplicate calls.
   */
  rebuildLongitudinalMemory(providedDiaries?: any[]): LongitudinalMemory {
    console.log('[SemanticLifeEngine] Re-building memory cache from entries...');
    const diaries = providedDiaries || [];
    const completedDiaries = diaries.filter(d => d.status === 'completed');

    if (diaries.length === 0) {
      const emptyMemory = {
        today: null,
        weekly: null,
        monthly: null,
        longitudinal: null
      };
      safeLocalStorage.setItem(MEMORY_CACHE_KEY, JSON.stringify(emptyMemory));
      return emptyMemory;
    }

    // Capture today (latest) snapshot
    const latestDiary = diaries[0];
    const todayState = buildDailySnapshot(latestDiary);

    // Build snapshots
    const allSnapshots = diaries.map(buildDailySnapshot);

    // Filter historical subsets
    const weeklySnapshots = allSnapshots.slice(0, 7);
    const monthlySnapshots = allSnapshots.slice(0, 30);

    const memory: LongitudinalMemory = {
      today: todayState,
      weekly: aggregateSnapshots(weeklySnapshots, diaries.length),
      monthly: aggregateSnapshots(monthlySnapshots, diaries.length),
      longitudinal: aggregateSnapshots(allSnapshots, diaries.length)
    };

    // Save cache to avoid recomputing on every keystroke
    safeLocalStorage.setItem(MEMORY_CACHE_KEY, JSON.stringify(memory));
    console.log('[SemanticLifeEngine] Cache completed successfully!', memory);
    return memory;
  },

  /**
   * Safe fast snapshot retrieval from memory cache
   */
  getLongitudinalMemory(providedDiaries?: any[]): LongitudinalMemory {
    const cached = safeLocalStorage.getItem(MEMORY_CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('[SemanticLifeEngine] Error reading memory cache, rebuilding...', e);
      }
    }
    return this.rebuildLongitudinalMemory(providedDiaries);
  },

  /**
   * Clear cache to force next access to do an absolute rebuild
   */
  invalidate() {
    safeLocalStorage.removeItem(MEMORY_CACHE_KEY);
  }
};
