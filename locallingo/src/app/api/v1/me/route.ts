import { z } from "zod";
import { db } from "@/lib/db";
import { ACTIVE_CURRENCIES, SUPPORTED_LOCALES } from "@/lib/constants";
import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";

export const GET = api(async () => {
  const user = await requireUser();
  const unread = await db.notification.count({ where: { userId: user.id, readAt: null } });
  return { ...user, unreadNotifications: unread };
});

const schema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  locale: z.enum(SUPPORTED_LOCALES).optional(),
  currency: z.enum(ACTIVE_CURRENCIES).optional(),
  phone: z.string().trim().max(30).optional(),
});

export const PATCH = api(async (req) => {
  const user = await requireUser();
  const input = await parseBody(req, schema);
  await db.user.update({ where: { id: user.id }, data: input });
  return { ok: true };
});
