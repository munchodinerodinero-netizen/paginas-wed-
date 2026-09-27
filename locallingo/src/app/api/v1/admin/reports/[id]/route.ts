import { z } from "zod";
import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { setReportStatus } from "@/server/services/admin";

export const POST = api<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const admin = await requireUser("ADMIN");
  const { status } = await parseBody(req, z.object({ status: z.enum(["RESOLVED", "DISMISSED"]) }));
  await setReportStatus(admin, (await params).id, status);
  return { ok: true };
});
