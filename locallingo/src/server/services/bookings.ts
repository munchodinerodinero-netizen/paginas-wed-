import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { applyBps, priceBreakdown, serviceSubtotal } from "@/lib/money";
import { touristRefundPercent } from "@/lib/policies";
import { localSlot, zonedToUtc } from "@/lib/time";
import type { SessionUser } from "../auth";
import { AppError, badRequest, conflict, forbidden, notFound } from "../errors";
import { paymentProvider } from "../payments";
import { notify } from "./notify";
import { getCommissionBps } from "./settings";

const MIN_LEAD_HOURS = 2;
const PAYMENT_HOLD_MINUTES = 30; // una reserva sin pagar bloquea el horario solo 30 min

function bookingCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return "LL-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export interface BookingInput {
  serviceId: string;
  date: string; // YYYY-MM-DD (hora local de la ciudad)
  time: string; // HH:MM
  durationMin?: number; // solo servicios por hora
  people: number;
  meetingPoint?: string;
  notes?: string;
}

async function loadService(serviceId: string) {
  const service = await db.service.findUnique({
    where: { id: serviceId },
    include: { guide: { include: { user: true, city: true, availability: true } }, city: true },
  });
  if (!service || !service.active) throw notFound();
  if (service.guide.status !== "APPROVED" || service.guide.user.status !== "ACTIVE") {
    throw new AppError(409, "GUIDE_NOT_AVAILABLE");
  }
  return service;
}

/** Calcula precio y valida horario sin crear nada (para la vista previa del formulario). */
export async function quoteBooking(input: Pick<BookingInput, "serviceId" | "durationMin">) {
  const service = await loadService(input.serviceId);
  const durationMin = service.pricingType === "HOURLY" ? input.durationMin ?? service.durationMin : service.durationMin;
  const subtotalMinor = serviceSubtotal({ pricingType: service.pricingType, priceMinor: service.priceMinor, durationMin });
  const commissionBps = await getCommissionBps(service.categoryId);
  return { service, durationMin, breakdown: priceBreakdown({ subtotalMinor, commissionBps }) };
}

async function assertSlotFree(guideId: string, startAt: Date, durationMin: number, excludeId?: string) {
  const endAt = new Date(startAt.getTime() + durationMin * 60_000);
  const holdCutoff = new Date(Date.now() - PAYMENT_HOLD_MINUTES * 60_000);
  const candidates = await db.booking.findMany({
    where: {
      guideId,
      id: excludeId ? { not: excludeId } : undefined,
      startAt: { lt: endAt, gte: new Date(startAt.getTime() - 24 * 3600_000) },
      OR: [{ status: { in: ["PENDING", "ACCEPTED"] } }, { status: "PENDING_PAYMENT", createdAt: { gte: holdCutoff } }],
    },
    select: { startAt: true, durationMin: true },
  });
  const overlaps = candidates.some((b) => b.startAt < endAt && new Date(b.startAt.getTime() + b.durationMin * 60_000) > startAt);
  if (overlaps) throw conflict("SLOT_UNAVAILABLE");
}

export async function createBooking(user: SessionUser, input: BookingInput) {
  const { service, durationMin, breakdown } = await quoteBooking(input);
  if (service.guide.userId === user.id) throw forbidden();
  if (input.people < 1 || input.people > service.maxPeople) throw badRequest("TOO_MANY_PEOPLE");
  if (service.pricingType === "HOURLY" && (durationMin < 60 || durationMin > 12 * 60 || durationMin % 30 !== 0)) {
    throw badRequest("VALIDATION_ERROR");
  }

  const tz = service.city?.timezone ?? service.guide.city?.timezone ?? "America/Mexico_City";
  const startAt = zonedToUtc(input.date, input.time, tz);
  if (Number.isNaN(startAt.getTime()) || startAt.getTime() < Date.now() + MIN_LEAD_HOURS * 3600_000) {
    throw badRequest("PAST_DATE");
  }

  // Debe caer completo dentro de un bloque de disponibilidad semanal del guía.
  const { weekday, minute } = localSlot(startAt, tz);
  const fits = service.guide.availability.some((a) => a.weekday === weekday && a.startMinute <= minute && minute + durationMin <= a.endMinute);
  if (!fits) throw conflict("SLOT_UNAVAILABLE");
  await assertSlotFree(service.guideId, startAt, durationMin);

  const booking = await db.booking.create({
    data: {
      code: bookingCode(),
      touristId: user.id,
      guideId: service.guideId,
      serviceId: service.id,
      startAt,
      durationMin,
      people: input.people,
      meetingPoint: input.meetingPoint || service.meetingPoint,
      notes: input.notes,
      status: "PENDING_PAYMENT",
      currency: service.currency,
      ...breakdown,
    },
  });
  return booking;
}

async function loadBookingFor(user: SessionUser, id: string) {
  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      service: { include: { category: true } },
      guide: { include: { user: { select: { id: true, name: true } }, city: true } },
      tourist: { select: { id: true, name: true } },
      payments: { orderBy: { createdAt: "asc" } },
      reviews: true,
    },
  });
  if (!booking) throw notFound();
  const isTourist = booking.touristId === user.id;
  const isGuide = booking.guide.userId === user.id;
  if (!isTourist && !isGuide && user.role !== "ADMIN") throw notFound();
  return { booking, isTourist, isGuide };
}

export async function getBooking(user: SessionUser, id: string) {
  return loadBookingFor(user, id);
}

function heldCharge(booking: { payments: { kind: string; status: string; providerRef: string | null; id: string }[] }) {
  return booking.payments.find((p) => p.kind === "CHARGE" && (p.status === "HELD" || p.status === "CAPTURED"));
}

export async function payBooking(user: SessionUser, id: string) {
  const { booking, isTourist } = await loadBookingFor(user, id);
  if (!isTourist) throw forbidden();
  if (booking.status !== "PENDING_PAYMENT") throw conflict("INVALID_STATE");
  await assertSlotFree(booking.guideId, booking.startAt, booking.durationMin, booking.id);

  const provider = paymentProvider();
  const charge = await provider.createCharge({
    amountMinor: booking.totalMinor,
    currency: booking.currency,
    bookingId: booking.id,
    customerEmail: user.email,
  });
  if (charge.status === "FAILED") throw new AppError(402, "PAYMENT_FAILED");

  await db.$transaction([
    db.payment.create({
      data: {
        bookingId: booking.id,
        provider: provider.name,
        providerRef: charge.providerRef,
        amountMinor: booking.totalMinor,
        currency: booking.currency,
        status: charge.status === "HELD" ? "HELD" : "PENDING",
      },
    }),
    db.booking.update({ where: { id: booking.id }, data: { status: charge.status === "HELD" ? "PENDING" : "PENDING_PAYMENT" } }),
  ]);
  if (charge.status === "HELD") await notify(booking.guide.userId, "BOOKING_REQUESTED", { code: booking.code });
  return { redirectUrl: charge.redirectUrl ?? null };
}

export async function acceptBooking(user: SessionUser, id: string) {
  const { booking, isGuide } = await loadBookingFor(user, id);
  if (!isGuide) throw forbidden();
  if (booking.status !== "PENDING") throw conflict("INVALID_STATE");
  const charge = heldCharge(booking);
  if (!charge?.providerRef) throw conflict("INVALID_STATE");
  await paymentProvider().capture(charge.providerRef);
  await db.$transaction([
    db.payment.update({ where: { id: charge.id }, data: { status: "CAPTURED" } }),
    db.booking.update({ where: { id }, data: { status: "ACCEPTED", acceptedAt: new Date() } }),
  ]);
  await notify(booking.touristId, "BOOKING_ACCEPTED", { code: booking.code });
}

async function refund(booking: Awaited<ReturnType<typeof loadBookingFor>>["booking"], amountMinor: number) {
  const charge = heldCharge(booking);
  if (!charge?.providerRef) return;
  const provider = paymentProvider();
  if (charge.status === "HELD" && amountMinor === booking.totalMinor) {
    await provider.release(charge.providerRef);
    await db.payment.update({ where: { id: charge.id }, data: { status: "REFUNDED" } });
    return;
  }
  if (amountMinor <= 0) return;
  const r = await provider.refund(charge.providerRef, amountMinor);
  await db.payment.create({
    data: { bookingId: booking.id, provider: provider.name, providerRef: r.providerRef, kind: "REFUND", amountMinor, currency: booking.currency, status: "REFUNDED" },
  });
}

export async function rejectBooking(user: SessionUser, id: string, reason?: string) {
  const { booking, isGuide } = await loadBookingFor(user, id);
  if (!isGuide) throw forbidden();
  if (booking.status !== "PENDING") throw conflict("INVALID_STATE");
  await refund(booking, booking.totalMinor);
  await db.booking.update({
    where: { id },
    data: { status: "REJECTED", cancelledBy: "GUIDE", cancelReason: reason, cancelledAt: new Date(), refundMinor: booking.totalMinor, guideNetMinor: 0, commissionMinor: 0 },
  });
  await notify(booking.touristId, "BOOKING_REJECTED", { code: booking.code });
}

export async function cancelBooking(user: SessionUser, id: string, reason?: string) {
  const { booking, isTourist, isGuide } = await loadBookingFor(user, id);
  if (!["PENDING_PAYMENT", "PENDING", "ACCEPTED"].includes(booking.status)) throw conflict("INVALID_STATE");

  let by: string;
  let refundMinor = booking.totalMinor;
  if (isTourist) {
    by = "TOURIST";
    if (booking.status === "ACCEPTED") {
      const hoursBefore = (booking.startAt.getTime() - Date.now()) / 3600_000;
      const pct = touristRefundPercent(booking.guide.cancellationPolicy, hoursBefore);
      refundMinor = Math.round((booking.totalMinor * pct) / 100);
    }
  } else if (isGuide) {
    by = "GUIDE"; // si el guía cancela, reembolso completo siempre
  } else {
    by = "ADMIN";
  }
  if (booking.status === "PENDING_PAYMENT") refundMinor = 0;
  else await refund(booking, refundMinor);

  // Lo no reembolsado se reparte con la misma comisión (compensación al guía por cancelación tardía).
  const retained = booking.status === "PENDING_PAYMENT" ? 0 : booking.totalMinor - refundMinor;
  const commissionMinor = applyBps(retained, booking.commissionBps);
  await db.booking.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledBy: by,
      cancelReason: reason,
      cancelledAt: new Date(),
      refundMinor,
      commissionMinor,
      guideNetMinor: retained - commissionMinor,
    },
  });
  const other = isTourist ? booking.guide.userId : booking.touristId;
  await notify(other, "BOOKING_CANCELLED", { code: booking.code, by });
  return { refundMinor };
}

export async function completeBooking(user: SessionUser, id: string) {
  const { booking, isGuide } = await loadBookingFor(user, id);
  if (!isGuide && user.role !== "ADMIN") throw forbidden();
  if (booking.status !== "ACCEPTED") throw conflict("INVALID_STATE");
  if (booking.startAt.getTime() > Date.now()) throw conflict("INVALID_STATE");
  await db.$transaction([
    db.booking.update({ where: { id }, data: { status: "COMPLETED", completedAt: new Date() } }),
    db.guideProfile.update({ where: { id: booking.guideId }, data: { completedBookings: { increment: 1 } } }),
  ]);
  await notify(booking.touristId, "BOOKING_COMPLETED_REVIEW", { code: booking.code, bookingId: booking.id });
}

const listInclude = {
  service: { select: { title: true } },
  guide: { select: { displayName: true, slug: true, photoUrl: true, userId: true } },
  tourist: { select: { name: true } },
  reviews: { select: { direction: true } },
} as const;

export async function listTouristBookings(userId: string) {
  return db.booking.findMany({ where: { touristId: userId }, include: listInclude, orderBy: { startAt: "desc" } });
}

export async function listGuideBookings(guideId: string) {
  return db.booking.findMany({ where: { guideId, status: { not: "PENDING_PAYMENT" } }, include: listInclude, orderBy: { startAt: "asc" } });
}

/** Ganancias del guía. El saldo disponible = neto de servicios cerrados − retiros. */
export async function guideEarnings(guideId: string) {
  const closed = await db.booking.findMany({
    where: { guideId, OR: [{ status: "COMPLETED" }, { status: "CANCELLED", cancelledBy: "TOURIST", guideNetMinor: { gt: 0 } }] },
    select: { totalMinor: true, refundMinor: true, commissionMinor: true, guideNetMinor: true, currency: true },
  });
  const payouts = await db.payout.findMany({ where: { guideId, status: { in: ["REQUESTED", "PAID"] } } });
  const gross = closed.reduce((s, b) => s + b.totalMinor - b.refundMinor, 0);
  const commission = closed.reduce((s, b) => s + b.commissionMinor, 0);
  const net = closed.reduce((s, b) => s + b.guideNetMinor, 0);
  const paidOut = payouts.reduce((s, p) => s + p.amountMinor, 0);
  const pending = await db.booking.aggregate({ where: { guideId, status: "ACCEPTED" }, _sum: { guideNetMinor: true } });
  return { gross, commission, net, available: net - paidOut, upcoming: pending._sum.guideNetMinor ?? 0 };
}

export async function requestPayout(user: SessionUser) {
  const guide = await db.guideProfile.findUnique({ where: { userId: user.id } });
  if (!guide) throw forbidden();
  // Un retiro a la vez: evita duplicados por doble clic o peticiones concurrentes.
  const open = await db.payout.count({ where: { guideId: guide.id, status: "REQUESTED" } });
  if (open) throw conflict("INVALID_STATE");
  const { available } = await guideEarnings(guide.id);
  if (available <= 0) throw badRequest("INSUFFICIENT_BALANCE");
  return db.payout.create({ data: { guideId: guide.id, amountMinor: available, currency: guide.currency } });
}
