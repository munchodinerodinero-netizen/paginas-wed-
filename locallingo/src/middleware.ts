import { NextResponse, type NextRequest } from "next/server";

// CORS para la API v1. Las apps nativas (Android/iOS) no necesitan CORS; esto es para la
// versión web de la app móvil (Expo web) y herramientas de desarrollo.
// Solo se permiten los orígenes listados en CORS_ORIGINS (separados por comas).
// No se permiten credenciales (cookies): los clientes externos usan `Authorization: Bearer`.
const allowed = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin");
  const ok = origin && allowed.includes(origin);
  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    if (ok) setCors(res, origin);
    return res;
  }
  const res = NextResponse.next();
  if (ok) setCors(res, origin);
  return res;
}

function setCors(res: NextResponse, origin: string) {
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Vary", "Origin");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Authorization,Content-Type,Accept-Language");
  res.headers.set("Access-Control-Max-Age", "600");
}

export const config = { matcher: "/api/v1/:path*" };
