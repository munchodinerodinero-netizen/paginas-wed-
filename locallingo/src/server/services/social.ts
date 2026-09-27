import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";
import { REPORT_REASONS } from "@/lib/constants";
import { filterMessage } from "@/lib/message-filter";
import type { SessionUser } from "../auth";
import { AppError, badRequest, conflict, forbidden, notFound } from "../errors";
import { notify } from "./notify";

// ---------- Mensajes ----------

export async function ensureConversation(touristId: string, guideUserId: string) {
  if (touristId === guideUserId) throw badRequest();
  return db.conversation.upsert({
    where: { touristId_guideUserId: { touristId, guideUserId } },
    create: { touristId, guideUserId },
    update: {},
  });
}

/** El turista abre (o retoma) la conversación con un guía desde su perfil. */
export async function startConversationWithGuide(user: SessionUser, guideId: string) {
  const guide = await db.guideProfile.findUnique({ where: { id: guideId } });
  if (!guide || guide.status !== "APPROVED") throw notFound();
  return ensureConversation(user.id, guide.userId);
}

async function loadConversation(user: SessionUser, id: string) {
  const conv = await db.conversation.findUnique({
    where: { id },
    include: {
      tourist: { select: { id: true, name: true } },
      guideUser: { select: { id: true, name: true, guideProfile: { select: { displayName: true, slug: true, photoUrl: true } } } },
    },
  });
  if (!conv || (conv.touristId !== user.id && conv.guideUserId !== user.id && user.role !== "ADMIN")) throw notFound();
  const otherId = conv.touristId === user.id ? conv.guideUserId : conv.touristId;
  return { conv, otherId };
}

export async function isBlocked(a: string, b: string) {
  return (await db.block.count({ where: { OR: [{ blockerId: a, blockedId: b }, { blockerId: b, blockedId: a }] } })) > 0;
}

export async function listConversations(user: SessionUser) {
  const convs = await db.conversation.findMany({
    where: { OR: [{ touristId: user.id }, { guideUserId: user.id }] },
    include: {
      tourist: { select: { id: true, name: true } },
      guideUser: { select: { id: true, name: true, guideProfile: { select: { displayName: true, photoUrl: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
  });
  const unread = await db.message.groupBy({
    by: ["conversationId"],
    where: { conversationId: { in: convs.map((c) => c.id) }, senderId: { not: user.id }, readAt: null },
    _count: true,
  });
  const unreadMap = new Map(unread.map((u) => [u.conversationId, u._count]));
  return convs.map((c) => {
    const isTourist = c.touristId === user.id;
    return {
      id: c.id,
      otherName: isTourist ? c.guideUser.guideProfile?.displayName ?? c.guideUser.name : c.tourist.name,
      otherPhoto: isTourist ? c.guideUser.guideProfile?.photoUrl ?? null : null,
      lastMessage: c.messages[0]?.body ?? "",
      lastMessageAt: c.lastMessageAt.toISOString(),
      unread: unreadMap.get(c.id) ?? 0,
    };
  });
}

export async function getConversation(user: SessionUser, id: string) {
  const { conv, otherId } = await loadConversation(user, id);
  await db.message.updateMany({ where: { conversationId: id, senderId: { not: user.id }, readAt: null }, data: { readAt: new Date() } });
  const messages = await db.message.findMany({ where: { conversationId: id }, orderBy: { createdAt: "asc" }, take: 500 });
  const blockedByMe = (await db.block.count({ where: { blockerId: user.id, blockedId: otherId } })) > 0;
  const isTourist = conv.touristId === user.id;
  return {
    id: conv.id,
    otherId,
    otherName: isTourist ? conv.guideUser.guideProfile?.displayName ?? conv.guideUser.name : conv.tourist.name,
    otherSlug: isTourist ? conv.guideUser.guideProfile?.slug ?? null : null,
    blocked: await isBlocked(user.id, otherId),
    blockedByMe,
    messages: messages.map((m) => ({ id: m.id, mine: m.senderId === user.id, body: m.body, redacted: m.redacted, createdAt: m.createdAt.toISOString(), read: !!m.readAt })),
  };
}

export async function sendMessage(user: SessionUser, conversationId: string, rawBody: string) {
  const { conv, otherId } = await loadConversation(user, conversationId);
  if (conv.touristId !== user.id && conv.guideUserId !== user.id) throw forbidden();
  if (await isBlocked(user.id, otherId)) throw new AppError(403, "BLOCKED");
  const body = rawBody.slice(0, 2000);
  const filtered = filterMessage(body);
  if (filtered.blocked) throw badRequest("CARD_NUMBER");
  if (!filtered.body) throw badRequest("VALIDATION_ERROR");
  const [message] = await db.$transaction([
    db.message.create({ data: { conversationId, senderId: user.id, body: filtered.body, redacted: filtered.redacted } }),
    db.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } }),
  ]);
  await notify(otherId, "NEW_MESSAGE", { conversationId, from: user.name });
  return { id: message.id, redacted: filtered.redacted };
}

export async function setBlock(user: SessionUser, otherId: string, blocked: boolean) {
  if (otherId === user.id) throw badRequest();
  if (blocked) {
    await db.block.upsert({ where: { blockerId_blockedId: { blockerId: user.id, blockedId: otherId } }, create: { blockerId: user.id, blockedId: otherId }, update: {} });
  } else {
    await db.block.deleteMany({ where: { blockerId: user.id, blockedId: otherId } });
  }
}

// ---------- Reseñas ----------

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  communication: z.number().int().min(1).max(5).optional(),
  punctuality: z.number().int().min(1).max(5).optional(),
  knowledge: z.number().int().min(1).max(5).optional(),
  experience: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).default(""),
});

export async function createReview(user: SessionUser, bookingId: string, input: z.infer<typeof reviewSchema>) {
  const booking = await db.booking.findUnique({ where: { id: bookingId }, include: { guide: true } });
  if (!booking || booking.touristId !== user.id) throw notFound();
  if (booking.status !== "COMPLETED") throw conflict("INVALID_STATE");
  const exists = await db.review.findUnique({ where: { bookingId_direction: { bookingId, direction: "TOURIST_TO_GUIDE" } } });
  if (exists) throw conflict("ALREADY_REVIEWED");
  await db.$transaction([
    db.review.create({
      data: { ...input, bookingId, authorId: user.id, targetUserId: booking.guide.userId, direction: "TOURIST_TO_GUIDE" },
    }),
    db.guideProfile.update({ where: { id: booking.guideId }, data: { ratingSum: { increment: input.rating }, ratingCount: { increment: 1 } } }),
  ]);
}

// ---------- Favoritos ----------

export async function toggleFavorite(user: SessionUser, guideId: string) {
  const existing = await db.favorite.findUnique({ where: { userId_guideId: { userId: user.id, guideId } } });
  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } });
    return { favorite: false };
  }
  if (!(await db.guideProfile.findUnique({ where: { id: guideId } }))) throw notFound();
  await db.favorite.create({ data: { userId: user.id, guideId } });
  return { favorite: true };
}

// ---------- Reportes ----------

export const reportSchema = z
  .object({
    reason: z.enum(REPORT_REASONS),
    details: z.string().max(2000).default(""),
    targetUserId: z.string().optional(),
    guideId: z.string().optional(),
    conversationId: z.string().optional(),
    bookingId: z.string().optional(),
  })
  .refine((r) => r.targetUserId || r.guideId || r.conversationId || r.bookingId, { message: "Falta el objetivo del reporte" });

export async function createReport(user: SessionUser, input: z.infer<typeof reportSchema>) {
  let targetUserId = input.targetUserId;
  if (input.guideId) targetUserId = (await db.guideProfile.findUnique({ where: { id: input.guideId } }))?.userId;
  if (input.conversationId) {
    const { otherId } = await loadConversation(user, input.conversationId);
    targetUserId = otherId;
  }
  if (input.bookingId) {
    const b = await db.booking.findUnique({ where: { id: input.bookingId }, include: { guide: true } });
    if (!b || (b.touristId !== user.id && b.guide.userId !== user.id)) throw notFound();
    targetUserId = b.touristId === user.id ? b.guide.userId : b.touristId;
  }
  return db.report.create({
    data: {
      reporterId: user.id,
      targetUserId,
      conversationId: input.conversationId,
      bookingId: input.bookingId,
      reason: input.reason,
      details: input.details,
    },
  });
}
