import { api } from "@/server/api";
import { requireUser } from "@/server/auth";
import { markPayoutPaid } from "@/server/services/admin";

export const POST = api<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  await markPayoutPaid(await requireUser("ADMIN"), (await params).id);
  return { ok: true };
});
