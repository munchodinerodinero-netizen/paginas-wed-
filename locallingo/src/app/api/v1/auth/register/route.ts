import { z } from "zod";
import { db } from "@/lib/db";
import { api, clientIp, parseBody } from "@/server/api";
import { createSessionToken, hashPassword, setSessionCookie } from "@/server/auth";
import { AppError, conflict } from "@/server/errors";
import { rateLimit } from "@/server/rate-limit";
import { getLocale } from "@/i18n/server";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8).max(200),
  role: z.enum(["TOURIST", "GUIDE"]), // ADMIN nunca se crea por registro público
});

export const POST = api(async (req) => {
  if (!rateLimit(`register:${await clientIp()}`, 10, 60 * 60_000)) throw new AppError(429, "RATE_LIMITED");
  const input = await parseBody(req, schema);
  if (await db.user.findUnique({ where: { email: input.email } })) throw conflict("EMAIL_TAKEN");
  const user = await db.user.create({
    data: { name: input.name, email: input.email, role: input.role, passwordHash: await hashPassword(input.password), locale: await getLocale() },
  });
  const token = await createSessionToken(user);
  await setSessionCookie(token);
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
});
