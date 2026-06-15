/** Base URL for API (no trailing `/api`). In dev, Vite proxies `/api` to Express. */
function normalizeApiBase(raw) {
  if (!raw || typeof raw !== "string") return "";
  let s = raw.trim().replace(/\/+$/, "");
  if (s.endsWith("/api")) s = s.slice(0, -4).replace(/\/+$/, "");
  return s;
}

export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL || "");
