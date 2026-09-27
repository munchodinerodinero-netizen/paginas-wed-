import "server-only";
import { db } from "@/lib/db";
import type { SessionUser } from "../auth";
import { notFound } from "../errors";
import { paymentProvider } from "../payments";
import { notify } from "./notify";

export async function logAdminAction(admin: SessionUser, action: string, targetType: string, targetId: string, details = "") {
  await db.adminAction.create({ data: { adminId: admin.id, action, targetType, targetId, details } });
}

/** Métricas clave del negocio (sección 29 del documento del proyecto). */
export async function getStats() {
  const [users, tourists, guides, activeGuides, pendingGuides, bookings, completed, cancellations, openReports, searches] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "TOURIST" } }),
    db.guideProfile.count(),
    db.guideProfile.count({ where: { status: "APPROVED", user: { status: "ACTIVE" } } }),
    db.guideProfile.count({ where: { status: "PENDING" } }),
    db.booking.count({ where: { status: { not: "PENDING_PAYMENT" } } }),
    db.booking.count({ where: { status: "COMPLETED" } }),
    db.booking.count({ where: { status: { in: ["CANCELLED", "REJECTED"] } } }),
    db.report.count({ where: { status: "OPEN" } }),
    db.searchEvent.count(),
  ]);

  const money = await db.booking.groupBy({
    by: ["currency"],
    where: { status: "COMPLETED" },
    _sum: { totalMinor: true, commissionMinor: true },
    _count: true,
  });
  const revenue = money.map((m) => ({
    currency: m.currency,
    gmvMinor: m._sum.totalMinor ?? 0,
    commissionMinor: m._sum.commissionMinor ?? 0,
    avgMinor: m._count ? Math.round((m._sum.totalMinor ?? 0) / m._count) : 0,
  }));

  const perTourist = await db.booking.groupBy({ by: ["touristId"], where: { status: { in: ["PENDING", "ACCEPTED", "COMPLETED"] } }, _count: true });
  const bookers = perTourist.length;
  const returning = perTourist.filter((t) => t._count >= 2).length;

  const ratings = await db.guideProfile.aggregate({ _sum: { ratingSum: true, ratingCount: true } });
  const avgRating = ratings._sum.ratingCount ? (ratings._sum.ratingSum ?? 0) / ratings._sum.ratingCount : null;

  // Conversión búsqueda → reserva: de los usuarios identificados que buscaron, cuántos pagaron una reserva.
  const searchers = await db.searchEvent.findMany({ where: { userId: { not: null } }, distinct: ["userId"], select: { userId: true } });
  const searcherIds = searchers.map((s) => s.userId!);
  const converted = searcherIds.length
    ? (await db.booking.findMany({ where: { touristId: { in: searcherIds }, status: { not: "PENDING_PAYMENT" } }, distinct: ["touristId"], select: { touristId: true } })).length
    : 0;

  return {
    users,
    tourists,
    guides,
    activeGuides,
    pendingGuides,
    bookings,
    completed,
    cancellations,
    openReports,
    revenue,
    returningPct: bookers ? Math.round((returning / bookers) * 100) : 0,
    avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    searches,
    searchers: searcherIds.length,
    conversionPct: searcherIds.length ? Math.round((converted / searcherIds.length) * 1000) / 10 : 0,
  };
}

export async function reviewGuide(admin: SessionUser, guideId: string, approve: boolean, reason?: string) {
  const g = await db.guideProfile.findUnique({ where: { id: guideId } });
  if (!g) throw notFound();
  await db.guideProfile.update({
    where: { id: guideId },
    data: approve ? { status: "APPROVED", verifiedAt: new Date(), rejectionReason: null } : { status: "REJECTED", rejectionReason: reason ?? "" },
  });
  await logAdminAction(admin, approve ? "GUIDE_APPROVED" : "GUIDE_REJECTED", "guide", guideId, reason);
  await notify(g.userId, approve ? "PROFILE_APPROVED" : "PROFILE_REJECTED", { reason });
}

export async function setUserStatus(admin: SessionUser, userId: string, status: "ACTIVE" | "SUSPENDED") {
  if (userId === admin.id) throw notFound();
  await db.user.update({
    where: { id: userId },
    // Suspender invalida todas las sesiones activas (web y app) al instante.
    data: { status, sessionVersion: { increment: status === "SUSPENDED" ? 1 : 0 } },
  });
  await logAdminAction(admin, status === "SUSPENDED" ? "USER_SUSPENDED" : "USER_REACTIVATED", "user", userId);
}

export async function setReportStatus(admin: SessionUser, reportId: string, status: "RESOLVED" | "DISMISSED") {
  await db.report.update({ where: { id: reportId }, data: { status, resolvedAt: new Date() } });
  await logAdminAction(admin, `REPORT_${status}`, "report", reportId);
}

export async function markPayoutPaid(admin: SessionUser, payoutId: string) {
  const p = await db.payout.findUnique({ where: { id: payoutId } });
  if (!p || p.status !== "REQUESTED") throw notFound();
  const res = await paymentProvider().payout({ amountMinor: p.amountMinor, currency: p.currency, guideId: p.guideId });
  await db.payout.update({ where: { id: payoutId }, data: { status: "PAID", processedAt: new Date(), providerRef: res.providerRef } });
  await logAdminAction(admin, "PAYOUT_PAID", "payout", payoutId);
}
