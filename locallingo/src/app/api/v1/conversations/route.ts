import { z } from "zod";
import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { listConversations, startConversationForBooking, startConversationWithGuide } from "@/server/services/social";

export const GET = api(async () => listConversations(await requireUser()));

export const POST = api(async (req) => {
  const user = await requireUser();
  const body = await parseBody(req, z.union([z.object({ guideId: z.string() }), z.object({ bookingId: z.string() })]));
  const conv = "guideId" in body ? await startConversationWithGuide(user, body.guideId) : await startConversationForBooking(user, body.bookingId);
  return { id: conv.id };
});
