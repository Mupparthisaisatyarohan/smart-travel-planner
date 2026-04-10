/**
 * API base URL.
 * - In dev: default "" so requests go to the Vite origin; vite.config.js proxies them to the Express server.
 * - Override with VITE_API_BASE_URL (e.g. http://localhost:3000) if you are not using the proxy.
 */
const raw = import.meta.env.VITE_API_BASE_URL;
export const BASE_URL =
  raw !== undefined && String(raw).trim() !== ''
    ? String(raw).replace(/\/$/, '')
    : '';