import { z } from "zod";
import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { listConversations, startConversationWithGuide } from "@/server/services/social";

export const GET = api(async () => listConversations(await requireUser()));

export const POST = api(async (req) => {
  const user = await requireUser();
  const { guideId } = await parseBody(req, z.object({ guideId: z.string() }));
  const conv = await startConversationWithGuide(user, guideId);
  return { id: conv.id };
});
