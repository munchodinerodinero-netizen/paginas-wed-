import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import type { Role } from "@/lib/constants";
import { forbidden, unauthorized } from "./errors";

// Sesión = JWT firmado (HS256). La web lo guarda en cookie httpOnly; la futura app
// móvil lo envía como `Authorization: Bearer <token>`. Mismo API para ambos.
export const SESSION_COOKIE = "ll_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET debe tener al menos 32 caracteres");
  return new TextEncoder().encode(s);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: { id: string; role: string; sessionVersion: number }) {
  return new SignJWT({ role: user.role, sv: user.sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret());
}

export async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  locale: string;
  currency: string;
};

async function readToken(): Promise<string | null> {
  const auth = (await headers()).get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

/** Usuario actual o null. Verifica firma, expiración, versión de sesión y suspensión. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await readToken();
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    const user = await db.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status !== "ACTIVE" || user.sessionVersion !== payload.sv) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      locale: user.locale,
      currency: user.currency,
    };
  } catch {
    return null;
  }
}

export async function requireUser(...roles: Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw unauthorized();
  if (roles.length && !roles.includes(user.role)) throw forbidden();
  return user;
}
