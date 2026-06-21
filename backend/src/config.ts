import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend root folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dlr-personal-os-secret-change-in-production',
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
};

// Validations
if (!config.geminiApiKey || config.geminiApiKey === 'MY_GEMINI_API_KEY') {
  console.warn('[Config Warning] GEMINI_API_KEY não foi configurada ou está com o valor padrão.');
}

if (!config.openRouterApiKey) {
  console.warn('[Config Warning] OPENROUTER_API_KEY não foi configurada.');
}

if (!config.databaseUrl) {
  console.warn('[Config Warning] DATABASE_URL não foi configurada. O banco utilizará os parâmetros de fallback.');
}

