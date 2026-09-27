import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { createReview, reviewSchema } from "@/server/services/social";

export const POST = api<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const user = await requireUser("TOURIST");
  await createReview(user, (await params).id, await parseBody(req, reviewSchema));
  return { ok: true };
});
