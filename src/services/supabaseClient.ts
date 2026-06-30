import { createClient } from '@supabase/supabase-js';

// Usar variáveis de ambiente do Vite se existirem, ou usar o fallback direto do self-hosted
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://supabasekong-x66wbwnbulrcp8shg16zcqra.187.127.3.42.sslip.io';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MjE0Nzk2MCwiZXhwIjo0OTM3ODIxNTYwLCJyb2xlIjoiYW5vbiJ9.iwEj92dqiASmCTNp4L5_MinZObDPmFCfx_8FodKcnTI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Utilitários para conversão entre camelCase (JS) e snake_case (Postgres/Supabase)
 */
export function camelToSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      let value = obj[key];
      // Se for array ou objeto complexo, mapeia recursivamente exceto se for Date ou Array simples/JSON strings
      if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        value = camelToSnake(value);
      }
      acc[snakeKey] = value;
      return acc;
    }, {});
  }
  return obj;
}

export function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key) => {
      const camelKey = key.replace(/([-_][a-z])/g, group =>
        group.toUpperCase().replace('-', '').replace('_', '')
      );
      let value = obj[key];
      if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        value = snakeToCamel(value);
      }
      acc[camelKey] = value;
      return acc;
    }, {});
  }
  return obj;
}
