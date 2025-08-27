export const API_URL: string =
  (window as any).__APP_CONFIG__?.API_URL ||
  (import.meta as any)?.env?.VITE_API_URL ||
  (window as any).API_URL ||
  "http://localhost:8000";
