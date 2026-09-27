import { z } from "zod";
import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { reviewGuide } from "@/server/services/admin";

export const POST = api<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const admin = await requireUser("ADMIN");
  const { approve, reason } = await parseBody(req, z.object({ approve: z.boolean(), reason: z.string().max(500).optional() }));
  await reviewGuide(admin, (await params).id, approve, reason);
  return { ok: true };
});
