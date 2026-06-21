import { api } from './api';
import { organismEventBus } from './organismEventBus';

export const DEFAULT_SENSATIONS = [
  'Parestesia', 'Calafrio benigno', 'Vassouramento energético', 'Presença amparadora', 
  'Expansibilidade', 'Balonamento', 'Mini-decolagem', 'EV espontâneo', 'Sonoridades intracranianas',
  'Vibração', 'Calor', 'Frio', 'Leveza', 'Expansão', 'Pulsação', 'Formigamento'
];

export const DEFAULT_PHENOMENA = [
  'Absorção de Energia', 'Exteriorização de Energia', 'Estado Vibracional (EV)', 
  'Projeção Lúcida', 'Clarividência Espontânea', 'Intuição Amparadora', 'Acoplamento Áurico',
  'Clarividência', 'Projeção', 'Pangrafia', 'Psicometria', 'Autofania'
];

export const DEFAULT_FATUISTICA = [
  { value: 'ev', label: 'Circularização de Energias (EV)' },
  { value: 'absorcao', label: 'Absorção de Energias' },
  { value: 'exteriorizacao', label: 'Exteriorização Cosmoconstante' },
  { value: 'tenepes', label: 'Pesquisa Assistencial / Equipe' },
  { value: 'consciencia_cosmica', label: 'Consciência Cósmica (Cosmoconsciência)' },
  { value: 'fenomenos_registrados', label: 'Fenômenos Registrados (Autopesquisa)' },
  { value: 'fenomenos_externos', label: 'Fenômenos Externos (Parafatos)' },
  { value: 'desassim', label: 'Desassimilação Simpática (Desassim)' },
  { value: 'projecao_lucida', label: 'Projeção Lúcida (Projeciologia)' },
  { value: 'acoplamento', label: 'Acoplamento Interconsciencial' },
  { value: 'auto_retrocognicao', label: 'Auto-retrocognição (Memória Holosomática)' }
];

export const DEFAULT_FATUISTICA_LABELS = DEFAULT_FATUISTICA.map(f => f.label);

export interface EnergyCatalogData {
  sensations: string[];
  phenomena: string[];
  fatuistica: string[];
}

class EnergyCatalogService {
  /**
   * Obtém a lista unificada de bioenergias da VPS
   * Se não houver dados, inicializa com os valores padrão.
   */
  async getCatalog(): Promise<EnergyCatalogData> {
    try {
      const data = await api.get<EnergyCatalogData>('/api/energy-work/catalog');
      
      // Valida e aplica fallbacks se vazios
      const sensations = data.sensations && data.sensations.length > 0 ? data.sensations : this.getLocalFallback('sensations', DEFAULT_SENSATIONS);
      const phenomena = data.phenomena && data.phenomena.length > 0 ? data.phenomena : this.getLocalFallback('phenomena', DEFAULT_PHENOMENA);
      const fatuistica = data.fatuistica && data.fatuistica.length > 0 ? data.fatuistica : this.getLocalFallback('fatuistica', DEFAULT_FATUISTICA_LABELS);

      // Atualiza o localstorage para manter sincronia offline/rápida
      localStorage.setItem('energy_work_sensations', JSON.stringify(sensations));
      localStorage.setItem('energy_work_phenomena', JSON.stringify(phenomena));
      localStorage.setItem('energy_work_fatuistica', JSON.stringify(fatuistica));

      return { sensations, phenomena, fatuistica };
    } catch (err) {
      console.warn('[EnergyCatalogService] Falha ao obter catálogo da VPS, usando fallback local...', err);
      return {
        sensations: this.getLocalFallback('sensations', DEFAULT_SENSATIONS),
        phenomena: this.getLocalFallback('phenomena', DEFAULT_PHENOMENA),
        fatuistica: this.getLocalFallback('fatuistica', DEFAULT_FATUISTICA_LABELS)
      };
    }
  }

  /**
   * Salva uma lista específica de bioenergias na VPS e propaga a sincronização em tempo real
   */
  async updateCatalog(type: 'sensations' | 'phenomena' | 'fatuistica', items: string[]): Promise<boolean> {
    try {
      // 1. Salva localmente primeiro para resposta instantânea na UI
      localStorage.setItem(`energy_work_${type}`, JSON.stringify(items));
      
      // 2. Persiste na VPS
      await api.put('/api/energy-work/catalog', {
        catalog_type: type,
        items
      });
      
      // 3. Emite o evento no barramento para que outras abas ou modais abertos recarreguem imediatamente
      organismEventBus.emit('energyCatalogUpdated');
      return true;
    } catch (err) {
      console.error(`[EnergyCatalogService] Falha ao salvar catálogo ${type} na VPS:`, err);
      // Propaga o evento local mesmo se falhar para manter a UI funcionando em modo tolerante à falhas
      organismEventBus.emit('energyCatalogUpdated');
      return false;
    }
  }

  private getLocalFallback(type: 'sensations' | 'phenomena' | 'fatuistica', defaults: string[]): string[] {
    try {
      const cached = localStorage.getItem(`energy_work_${type}`);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn(`[EnergyCatalogService] Erro ao ler cache de ${type}, usando constantes:`, e);
    }
    return defaults;
  }
}

export const energyCatalogService = new EnergyCatalogService();
