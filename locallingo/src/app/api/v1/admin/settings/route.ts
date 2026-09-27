import { z } from "zod";
import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { logAdminAction } from "@/server/services/admin";
import { SETTING_KEYS, getCommissionBps, setSetting } from "@/server/services/settings";

export const GET = api(async () => {
  await requireUser("ADMIN");
  return { commissionBps: await getCommissionBps() };
});

export const PUT = api(async (req) => {
  const admin = await requireUser("ADMIN");
  const { commissionBps } = await parseBody(req, z.object({ commissionBps: z.number().int().min(0).max(5000) }));
  await setSetting(SETTING_KEYS.commissionBps, String(commissionBps));
  await logAdminAction(admin, "COMMISSION_UPDATED", "setting", SETTING_KEYS.commissionBps, String(commissionBps));
  return { commissionBps };
});
