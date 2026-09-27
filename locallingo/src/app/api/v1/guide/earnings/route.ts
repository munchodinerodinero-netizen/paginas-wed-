import { db } from "@/lib/db";
import { api } from "@/server/api";
import { requireUser } from "@/server/auth";
import { forbidden } from "@/server/errors";
import { guideEarnings } from "@/server/services/bookings";

export const GET = api(async () => {
  const user = await requireUser("GUIDE");
  const guide = await db.guideProfile.findUnique({ where: { userId: user.id } });
  if (!guide) throw forbidden();
  const payouts = await db.payout.findMany({ where: { guideId: guide.id }, orderBy: { createdAt: "desc" } });
  return { currency: guide.currency, ...(await guideEarnings(guide.id)), payouts };
});
