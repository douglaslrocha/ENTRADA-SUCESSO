import { safeLocalStorage } from '../utils/storage';
import { supabase } from './supabaseClient';

export type PageType = 'diary' | 'finance' | 'objectives' | 'dashboard' | 'amparadora';

export const DEFAULT_IMAGES: Record<PageType, string[]> = {
  amparadora: [
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2074&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop"
  ],
  dashboard: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop"
  ],
  diary: [
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop"
  ],
  finance: [
    "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=1920",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1920",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920"
  ],
  objectives: [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920",
    "https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&q=80&w=1920",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1920",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1920"
  ]
};

const STORAGE_KEY = 'experience_backgrounds';

export const backgroundService = {
  getImages(page: PageType): string[] {
    const saved = safeLocalStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_IMAGES[page];
    
    try {
      const data = JSON.parse(saved);
      return data[page] || DEFAULT_IMAGES[page];
    } catch {
      return DEFAULT_IMAGES[page];
    }
  },

  async setImages(page: PageType, images: string[]) {
    const saved = safeLocalStorage.getItem(STORAGE_KEY);
    let data: any = {};
    
    if (saved) {
      try {
        data = JSON.parse(saved);
      } catch {}
    }
    
    data[page] = images;
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Dispatch custom event to notify local listeners
    window.dispatchEvent(new CustomEvent('backgrounds-updated', { detail: { page } }));
    
    // Sync to Supabase in background
    try {
      const upsertData = {
        user_id: 'default',
        [page]: images,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('experience_backgrounds')
        .upsert(upsertData, { onConflict: 'user_id' });
        
      if (error) throw error;
      console.log(`[backgroundService] Backgrounds updated in Supabase for page: ${page}`);
    } catch (e) {
      console.warn('[backgroundService] Error saving backgrounds to Supabase:', e);
    }
  },

  async syncWithBackend() {
    try {
      const { data, error } = await supabase
        .from('experience_backgrounds')
        .select('*')
        .eq('user_id', 'default')
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        const localData: Record<PageType, string[]> = {
          amparadora: data.amparadora || DEFAULT_IMAGES.amparadora,
          dashboard: data.dashboard || DEFAULT_IMAGES.dashboard,
          diary: data.diary || DEFAULT_IMAGES.diary,
          finance: data.finance || DEFAULT_IMAGES.finance,
          objectives: data.objectives || DEFAULT_IMAGES.objectives,
        };
        
        safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
        
        // Dispatch events to reload current page UIs
        (Object.keys(localData) as PageType[]).forEach(page => {
          window.dispatchEvent(new CustomEvent('backgrounds-updated', { detail: { page } }));
        });
        
        console.log('[backgroundService] Backgrounds successfully synchronized from Supabase.');
      } else {
        // Seed default images to server
        const defaultRecord = {
          user_id: 'default',
          amparadora: DEFAULT_IMAGES.amparadora,
          dashboard: DEFAULT_IMAGES.dashboard,
          diary: DEFAULT_IMAGES.diary,
          finance: DEFAULT_IMAGES.finance,
          objectives: DEFAULT_IMAGES.objectives,
        };
        await supabase.from('experience_backgrounds').insert(defaultRecord);
      }
    } catch (e) {
      console.warn('[backgroundService] Error syncing backgrounds from Supabase:', e);
    }
  },

  async reset(page: PageType) {
    await this.setImages(page, DEFAULT_IMAGES[page]);
  }
};
