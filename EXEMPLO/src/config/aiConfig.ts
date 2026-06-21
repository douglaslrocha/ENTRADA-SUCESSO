export const AI_CONFIG = {
  model: "gemini-3-flash-preview", // Principal model for speed and efficiency
  proModel: "gemini-3.1-pro-preview", // Complex reasoning model
  apiKey: "",
  baseURL: "https://openrouter.ai/api/v1",
};

const defaultBackendUrl = (import.meta as any).env.DEV ? 'http://localhost:3000' : '';
export const BACKEND_URL = ((import.meta as any).env.VITE_API_URL || defaultBackendUrl).replace(/\/$/, '');

