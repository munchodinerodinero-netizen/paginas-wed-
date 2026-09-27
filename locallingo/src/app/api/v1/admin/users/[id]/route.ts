import { z } from "zod";
import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { setUserStatus } from "@/server/services/admin";

export const POST = api<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const admin = await requireUser("ADMIN");
  const { status } = await parseBody(req, z.object({ status: z.enum(["ACTIVE", "SUSPENDED"]) }));
  await setUserStatus(admin, (await params).id, status);
  return { ok: true };
});
