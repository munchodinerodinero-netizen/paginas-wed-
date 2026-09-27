import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { localized } from "@/lib/i18n-data";
import { serviceSubtotal } from "@/lib/money";
import { weekdayOfDate } from "@/lib/time";

const guideInclude = {
  user: { select: { id: true } },
  city: { include: { country: true } },
  languages: { include: { language: true } },
  services: { where: { active: true }, include: { category: true, languages: { include: { language: true } }, city: true } },
  availability: true,
  photos: { orderBy: { sort: "asc" } },
} satisfies Prisma.GuideProfileInclude;

type GuideWithRelations = Prisma.GuideProfileGetPayload<{ include: typeof guideInclude }>;

export interface GuideCard {
  id: string;
  slug: string;
  displayName: string;
  photoUrl: string | null;
  headline: string;
  city: string;
  country: string;
  languages: { code: string; name: string; flag: string; level: string }[];
  rating: number | null;
  reviewCount: number;
  categories: string[];
  fromPriceMinor: number | null;
  fromIsHourly: boolean;
  currency: string;
  availableWeekdays: number[];
  verified: boolean;
  completedBookings: number;
  createdAt: string;
}

export function ratingOf(g: { ratingSum: number; ratingCount: number }) {
  return g.ratingCount ? Math.round((g.ratingSum / g.ratingCount) * 10) / 10 : null;
}

function fromPrice(g: GuideWithRelations) {
  if (g.hourlyRateMinor) return { minor: g.hourlyRateMinor, hourly: true };
  const prices = g.services.map((s) => ({ minor: s.priceMinor, hourly: s.pricingType === "HOURLY" }));
  if (!prices.length) return { minor: null, hourly: false };
  return prices.reduce((a, b) => (b.minor < a.minor ? b : a));
}

export function toCard(g: GuideWithRelations, locale: string): GuideCard {
  const price = fromPrice(g);
  const langs = [...g.languages].sort((a, b) => (a.level === "NATIVE" ? -1 : b.level === "NATIVE" ? 1 : 0));
  return {
    id: g.id,
    slug: g.slug,
    displayName: g.displayName,
    photoUrl: g.photoUrl,
    headline: g.headline,
    city: g.city ? localized(g.city.names, locale) : "",
    country: g.city ? localized(g.city.country.names, locale) : "",
    languages: langs.map((l) => ({ code: l.language.code, name: localized(l.language.names, locale), flag: l.language.flag, level: l.level })),
    rating: ratingOf(g),
    reviewCount: g.ratingCount,
    categories: [...new Set(g.services.map((s) => localized(s.category.names, locale)))],
    fromPriceMinor: price.minor,
    fromIsHourly: price.hourly,
    currency: g.currency,
    availableWeekdays: [...new Set(g.availability.map((a) => a.weekday))].sort(),
    verified: !!g.verifiedAt,
    completedBookings: g.completedBookings,
    createdAt: g.createdAt.toISOString(),
  };
}

export interface SearchFilters {
  city?: string; // slug
  country?: string; // slug
  language?: string; // code o slug
  category?: string; // slug
  minPrice?: number; // unidades menores
  maxPrice?: number;
  date?: string; // YYYY-MM-DD
  maxDurationMin?: number;
  minRating?: number;
  modality?: "IN_PERSON" | "REMOTE";
  sort?: "relevance" | "price_asc" | "price_desc" | "rating" | "popular" | "new";
  limit?: number;
}

/**
 * Búsqueda de guías aprobados. Filtros estructurales en SQL; precio/fecha/orden en memoria.
 * Suficiente para la beta (una ciudad, decenas de guías). Al escalar: mover a SQL con
 * columnas desnormalizadas (min_price, rating_avg) o a un índice de búsqueda.
 */
export async function searchGuides(f: SearchFilters, locale: string): Promise<GuideCard[]> {
  const serviceWhere: Prisma.ServiceWhereInput = { active: true };
  if (f.category) serviceWhere.category = { slug: f.category };
  if (f.modality) serviceWhere.modality = f.modality;
  if (f.maxDurationMin) serviceWhere.durationMin = { lte: f.maxDurationMin };

  const where: Prisma.GuideProfileWhereInput = {
    status: "APPROVED",
    user: { status: "ACTIVE" },
    services: { some: serviceWhere },
  };
  if (f.city) {
    where.OR = [{ city: { slug: f.city } }, { cities: { some: { city: { slug: f.city } } } }];
  } else if (f.country) {
    where.city = { country: { slug: f.country } };
  }
  if (f.language) where.languages = { some: { language: { OR: [{ code: f.language }, { slug: f.language }] } } };

  const guides = await db.guideProfile.findMany({ where, include: guideInclude, take: 200 });

  let cards = guides.map((g) => ({ card: toCard(g, locale), g }));

  cards = cards.filter(({ card, g }) => {
    if (f.minRating && (card.rating ?? 0) < f.minRating) return false;
    if (f.date && !g.availability.some((a) => a.weekday === weekdayOfDate(f.date!))) return false;
    if (f.minPrice != null || f.maxPrice != null) {
      const prices = g.services.map((s) => (s.pricingType === "HOURLY" ? s.priceMinor : serviceSubtotal(s)));
      if (g.hourlyRateMinor) prices.push(g.hourlyRateMinor);
      const ok = prices.some((p) => (f.minPrice == null || p >= f.minPrice) && (f.maxPrice == null || p <= f.maxPrice));
      if (!ok) return false;
    }
    return true;
  });

  const featured = (g: GuideWithRelations) => (g.featuredUntil && g.featuredUntil > new Date() ? 1 : 0);
  const price = (c: GuideCard) => c.fromPriceMinor ?? Number.MAX_SAFE_INTEGER;
  const sorters: Record<string, (a: (typeof cards)[0], b: (typeof cards)[0]) => number> = {
    price_asc: (a, b) => price(a.card) - price(b.card),
    price_desc: (a, b) => price(b.card) - price(a.card),
    rating: (a, b) => (b.card.rating ?? 0) - (a.card.rating ?? 0) || b.card.reviewCount - a.card.reviewCount,
    popular: (a, b) => b.card.completedBookings - a.card.completedBookings,
    new: (a, b) => b.g.createdAt.getTime() - a.g.createdAt.getTime(),
    // Relevancia: destacados, luego verificados, luego calificación bayesiana simple.
    relevance: (a, b) => {
      const score = (x: (typeof cards)[0]) =>
        featured(x.g) * 100 + (x.card.verified ? 10 : 0) + ((x.g.ratingSum + 4 * 3) / (x.g.ratingCount + 3)) + Math.log1p(x.card.completedBookings);
      return score(b) - score(a);
    },
  };
  cards.sort(sorters[f.sort ?? "relevance"] ?? sorters.relevance);
  return cards.slice(0, f.limit ?? 50).map((c) => c.card);
}

export async function getGuideBySlug(slug: string) {
  return db.guideProfile.findUnique({
    where: { slug },
    include: {
      ...guideInclude,
      cities: { include: { city: true } },
    },
  });
}

export async function getGuideReviews(guideUserId: string, take = 20) {
  return db.review.findMany({
    where: { targetUserId: guideUserId, direction: "TOURIST_TO_GUIDE", hidden: false },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
}

/** Perfil público: jamás incluye documentos, teléfono, email ni datos bancarios. */
export function publicGuide(g: NonNullable<Awaited<ReturnType<typeof getGuideBySlug>>>, locale: string) {
  return {
    ...toCard(g, locale),
    bio: g.bio,
    experience: g.experience,
    status: g.status,
    cancellationPolicy: g.cancellationPolicy,
    cityCoords: g.city?.lat != null && g.city?.lng != null ? { lat: g.city.lat, lng: g.city.lng } : null,
    cityTimezone: g.city?.timezone ?? "America/Mexico_City",
    photos: g.photos.map((p) => p.url),
    availability: g.availability.map((a) => ({ weekday: a.weekday, startMinute: a.startMinute, endMinute: a.endMinute })),
    services: g.services.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      category: localized(s.category.names, locale),
      categorySlug: s.category.slug,
      pricingType: s.pricingType,
      priceMinor: s.priceMinor,
      currency: s.currency,
      durationMin: s.durationMin,
      modality: s.modality,
      city: s.city ? localized(s.city.names, locale) : null,
      meetingPoint: s.meetingPoint,
      maxPeople: s.maxPeople,
      languages: s.languages.map((l) => localized(l.language.names, locale)),
    })),
  };
}
export type PublicGuide = ReturnType<typeof publicGuide>;
