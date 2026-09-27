import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { ACTIVE_CURRENCIES, SUPPORTED_LOCALES } from "@/lib/constants";
import { api, parseBody } from "@/server/api";
import { getSessionUser } from "@/server/auth";
import { CURRENCY_COOKIE, LOCALE_COOKIE } from "@/i18n/server";

const schema = z.object({ locale: z.enum(SUPPORTED_LOCALES).optional(), currency: z.enum(ACTIVE_CURRENCIES).optional() });

export const POST = api(async (req) => {
  const input = await parseBody(req, schema);
  const jar = await cookies();
  const opts = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" as const };
  if (input.locale) jar.set(LOCALE_COOKIE, input.locale, opts);
  if (input.currency) jar.set(CURRENCY_COOKIE, input.currency, opts);
  const user = await getSessionUser();
  if (user) await db.user.update({ where: { id: user.id }, data: input });
  return { ok: true };
});
