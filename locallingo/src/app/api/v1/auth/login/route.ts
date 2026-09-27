import { z } from "zod";
import { db } from "@/lib/db";
import { api, clientIp, parseBody } from "@/server/api";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/server/auth";
import { AppError } from "@/server/errors";
import { rateLimit } from "@/server/rate-limit";

const schema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) });

export const POST = api(async (req) => {
  const input = await parseBody(req, schema);
  if (!rateLimit(`login:${await clientIp()}:${input.email}`, 8, 15 * 60_000)) throw new AppError(429, "RATE_LIMITED");
  const user = await db.user.findUnique({ where: { email: input.email } });
  // Mismo error para usuario inexistente o contraseña incorrecta (no filtra qué emails existen).
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) throw new AppError(401, "INVALID_CREDENTIALS");
  if (user.status !== "ACTIVE") throw new AppError(403, "FORBIDDEN");
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const token = await createSessionToken(user);
  await setSessionCookie(token);
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
});
