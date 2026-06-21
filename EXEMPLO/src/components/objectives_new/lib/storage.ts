
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error instanceof Error && (
        error.name === 'QuotaExceededError' || 
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        console.error('LocalStorage quota exceeded. Attempting to clear non-critical data...');
        storage.clearDrafts();
        
        // Retry once after clearing drafts
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (retryError) {
          console.error('LocalStorage quota still exceeded after clearing drafts.', retryError);
          return false;
        }
      }
      return false;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  },

  clearDrafts: (): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('_draft_')) {
          localStorage.removeItem(key);
        }
      });
      console.info('Cleared all drafts from localStorage to free up space.');
    } catch (error) {
      console.error('Error clearing drafts:', error);
    }
  }
};
