"use client";

export class ApiError extends Error {
  constructor(public code: string, public status: number) {
    super(code);
  }
}

/** Cliente de la API v1 para componentes del navegador. */
export async function apiFetch<T = unknown>(path: string, opts: { method?: string; body?: unknown; form?: FormData } = {}): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    method: opts.method ?? (opts.body || opts.form ? "POST" : "GET"),
    headers: opts.form ? undefined : { "Content-Type": "application/json" },
    body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json?.error?.code ?? "INTERNAL_ERROR", res.status);
  return json.data as T;
}
