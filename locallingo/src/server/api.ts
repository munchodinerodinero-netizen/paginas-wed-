import "server-only";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ZodError, type ZodTypeAny, type z } from "zod";
import { AppError, badRequest, forbidden } from "./errors";

type Handler<C> = (req: Request, ctx: C) => Promise<unknown>;

/**
 * Envuelve un handler de API: JSON consistente `{ data }` / `{ error: { code, message } }`,
 * mapeo de errores y protección CSRF básica para peticiones con cookie.
 */
export function api<C = unknown>(handler: Handler<C>) {
  return async (req: Request, ctx: C) => {
    try {
      await checkOrigin(req);
      const result = await handler(req, ctx);
      if (result instanceof Response) return result;
      return NextResponse.json({ data: result ?? null });
    } catch (err) {
      if (err instanceof AppError) {
        return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: { code: "VALIDATION_ERROR", message: "Datos inválidos", issues: err.flatten().fieldErrors } },
          { status: 422 },
        );
      }
      console.error(err);
      return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Error interno" } }, { status: 500 });
    }
  };
}

const trustedOrigins = (process.env.CORS_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

// Las mutaciones con cookie deben venir del mismo origen. Los clientes móviles usan Bearer
// (no son vulnerables a CSRF) y las apps nativas no envían Origin. Los orígenes de confianza
// de CORS_ORIGINS (la versión web de la app) también se permiten.
async function checkOrigin(req: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  const h = await headers();
  if (h.get("authorization")?.startsWith("Bearer ")) return;
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!origin || !host || trustedOrigins.includes(origin)) return;
  if (new URL(origin).host !== host) throw forbidden();
}

export async function parseBody<S extends ZodTypeAny>(req: Request, schema: S): Promise<z.output<S>> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw badRequest("INVALID_JSON");
  }
  return schema.parse(json);
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}
