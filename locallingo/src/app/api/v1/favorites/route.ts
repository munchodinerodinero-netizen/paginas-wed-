import { z } from "zod";
import { db } from "@/lib/db";
import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { toggleFavorite } from "@/server/services/social";

export const GET = api(async () => {
  const user = await requireUser();
  const favs = await db.favorite.findMany({ where: { userId: user.id }, include: { guide: { select: { id: true, slug: true, displayName: true, photoUrl: true } } } });
  return favs.map((f) => f.guide);
});

export const POST = api(async (req) => {
  const user = await requireUser();
  const { guideId } = await parseBody(req, z.object({ guideId: z.string() }));
  return toggleFavorite(user, guideId);
});
