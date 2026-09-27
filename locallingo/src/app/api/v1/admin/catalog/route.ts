import { z } from "zod";
import { db } from "@/lib/db";
import { slugify } from "@/lib/i18n-data";
import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { logAdminAction } from "@/server/services/admin";

const names = z.object({ es: z.string().trim().min(2).max(80), en: z.string().trim().min(2).max(80) });
const schema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("city"), names, countryId: z.string(), timezone: z.string().default("America/Mexico_City"), lat: z.number().optional(), lng: z.number().optional() }),
  z.object({ type: z.literal("language"), names, code: z.string().trim().min(2).max(5), flag: z.string().max(8).default("") }),
  z.object({ type: z.literal("category"), names, icon: z.string().max(8).default(""), commissionBps: z.number().int().min(0).max(5000).optional() }),
]);

export const POST = api(async (req) => {
  const admin = await requireUser("ADMIN");
  const input = await parseBody(req, schema);
  const slug = slugify(input.names.es);
  let id: string;
  switch (input.type) {
    case "city":
      id = (await db.city.create({ data: { slug, names: JSON.stringify(input.names), countryId: input.countryId, timezone: input.timezone, lat: input.lat, lng: input.lng } })).id;
      break;
    case "language":
      id = (await db.language.create({ data: { slug, code: input.code.toLowerCase(), flag: input.flag, names: JSON.stringify(input.names) } })).id;
      break;
    case "category":
      id = (await db.category.create({ data: { slug, icon: input.icon, commissionBps: input.commissionBps, names: JSON.stringify(input.names) } })).id;
      break;
  }
  await logAdminAction(admin, `CATALOG_${input.type.toUpperCase()}_CREATED`, input.type, id);
  return { id };
});

const toggleSchema = z.object({ type: z.enum(["city", "language", "category"]), id: z.string(), active: z.boolean() });

export const PATCH = api(async (req) => {
  const admin = await requireUser("ADMIN");
  const { type, id, active } = await parseBody(req, toggleSchema);
  const data = { active };
  if (type === "city") await db.city.update({ where: { id }, data });
  if (type === "language") await db.language.update({ where: { id }, data });
  if (type === "category") await db.category.update({ where: { id }, data });
  await logAdminAction(admin, `CATALOG_${type.toUpperCase()}_${active ? "ENABLED" : "DISABLED"}`, type, id);
  return { ok: true };
});
