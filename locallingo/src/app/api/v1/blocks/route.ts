import { z } from "zod";
import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { setBlock } from "@/server/services/social";

export const POST = api(async (req) => {
  const user = await requireUser();
  const { userId, blocked } = await parseBody(req, z.object({ userId: z.string(), blocked: z.boolean() }));
  await setBlock(user, userId, blocked);
  return { blocked };
});
