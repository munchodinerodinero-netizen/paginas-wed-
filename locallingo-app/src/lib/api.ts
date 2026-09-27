// Cliente de la API v1 — la MISMA API que usa la web.
// Configurar EXPO_PUBLIC_API_URL (ej. https://api.locallingo.mx o http://192.168.1.10:3000
// para probar en un teléfono real contra tu computadora).
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public code: string, public status: number) {
    super(code);
  }
}

let token: string | null = null;
let locale = "es";
let onUnauthorized: (() => void) | null = null;

export function setApiToken(t: string | null) {
  token = t;
}
export function setApiLocale(l: string) {
  locale = l;
}
export function setOnUnauthorized(fn: () => void) {
  onUnauthorized = fn;
}

export async function api<T = unknown>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, {
      method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": locale,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", 0);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.();
    throw new ApiError(json?.error?.code ?? "INTERNAL_ERROR", res.status);
  }
  return json.data as T;
}

export const errorCode = (e: unknown) => (e instanceof ApiError ? e.code : "INTERNAL_ERROR");
