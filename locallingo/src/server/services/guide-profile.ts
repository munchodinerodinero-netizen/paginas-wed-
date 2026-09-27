import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";
import { CANCELLATION_POLICIES, ACTIVE_CURRENCIES, LANGUAGE_LEVELS, MODALITIES, PRICING_TYPES } from "@/lib/constants";
import { slugify } from "@/lib/i18n-data";
import { toMinor } from "@/lib/money";
import type { SessionUser } from "../auth";
import { badRequest, forbidden } from "../errors";

const money = z.string().regex(/^\d{1,7}(\.\d{1,2})?$/);

export const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  photoUrl: z.string().trim().max(500).refine((v) => v === "" || v.startsWith("/uploads/") || v.startsWith("https://"), "URL inválida").optional(),
  headline: z.string().trim().max(120).optional(),
  cityId: z.string().optional(),
  extraCityIds: z.array(z.string()).max(10).optional(),
  bio: z.string().trim().max(3000).optional(),
  experience: z.string().trim().max(3000).optional(),
  hourlyRate: money.or(z.literal("")).optional(),
  currency: z.enum(ACTIVE_CURRENCIES).optional(),
  cancellationPolicy: z.enum(CANCELLATION_POLICIES).optional(),
  idDocumentKey: z.string().startsWith("private/").optional(),
  legalDocumentKey: z.string().startsWith("private/").optional(),
  onboardingStep: z.number().int().min(1).max(6).optional(),
  photos: z.array(z.string().max(500)).max(12).optional(),
});

export const languagesSchema = z
  .array(z.object({ languageId: z.string(), level: z.enum(LANGUAGE_LEVELS) }))
  .min(1)
  .max(10)
  .refine((l) => l.some((x) => x.level === "NATIVE"), "Indica tu idioma nativo");

export const servicesSchema = z
  .array(
    z.object({
      id: z.string().optional(),
      categoryId: z.string(),
      title: z.string().trim().min(3).max(100),
      description: z.string().trim().max(2000).default(""),
      pricingType: z.enum(PRICING_TYPES),
      price: money,
      durationMin: z.number().int().min(30).max(24 * 60),
      modality: z.enum(MODALITIES),
      meetingPoint: z.string().trim().max(200).optional(),
      maxPeople: z.number().int().min(1).max(50).default(4),
      languageIds: z.array(z.string()).min(1),
    }),
  )
  .max(20);

export const availabilitySchema = z
  .array(z.object({ weekday: z.number().int().min(0).max(6), startMinute: z.number().int().min(0).max(1440), endMinute: z.number().int().min(0).max(1440) }))
  .max(50)
  .refine((a) => a.every((s) => s.endMinute > s.startMinute), "Horario inválido");

async function uniqueSlug(base: string) {
  const root = slugify(base) || "guia";
  for (let i = 0; i < 50; i++) {
    const slug = i ? `${root}-${i + 1}` : root;
    if (!(await db.guideProfile.findUnique({ where: { slug } }))) return slug;
  }
  return `${root}-${Date.now()}`;
}

export async function getOrCreateGuideProfile(user: SessionUser) {
  if (user.role !== "GUIDE") throw forbidden();
  const existing = await db.guideProfile.findUnique({ where: { userId: user.id } });
  if (existing) return existing;
  return db.guideProfile.create({ data: { userId: user.id, displayName: user.name, slug: await uniqueSlug(user.name) } });
}

export async function loadOwnProfile(user: SessionUser) {
  const g = await getOrCreateGuideProfile(user);
  return db.guideProfile.findUniqueOrThrow({
    where: { id: g.id },
    include: {
      city: true,
      cities: true,
      languages: true,
      services: { where: { active: true }, include: { languages: true } },
      availability: true,
      photos: { orderBy: { sort: "asc" } },
    },
  });
}

export async function updateProfile(user: SessionUser, input: z.infer<typeof profileSchema>) {
  const g = await getOrCreateGuideProfile(user);
  const { hourlyRate, extraCityIds, photos, ...rest } = input;
  const currency = input.currency ?? g.currency;
  await db.guideProfile.update({
    where: { id: g.id },
    data: {
      ...rest,
      photoUrl: rest.photoUrl === "" ? null : rest.photoUrl,
      hourlyRateMinor: hourlyRate === undefined ? undefined : hourlyRate === "" ? null : toMinor(hourlyRate, currency),
      onboardingStep: input.onboardingStep ? Math.max(g.onboardingStep, input.onboardingStep) : undefined,
    },
  });
  if (input.currency && input.currency !== g.currency) {
    // Todos los servicios de un guía usan su moneda.
    await db.service.updateMany({ where: { guideId: g.id }, data: { currency: input.currency } });
  }
  if (extraCityIds) {
    await db.guideCity.deleteMany({ where: { guideId: g.id } });
    await db.guideCity.createMany({ data: [...new Set(extraCityIds)].map((cityId) => ({ guideId: g.id, cityId })) });
  }
  if (photos) {
    await db.guidePhoto.deleteMany({ where: { guideId: g.id } });
    await db.guidePhoto.createMany({ data: photos.map((url, sort) => ({ guideId: g.id, url, sort })) });
  }
}

export async function setLanguages(user: SessionUser, input: z.infer<typeof languagesSchema>) {
  const g = await getOrCreateGuideProfile(user);
  await db.$transaction([
    db.guideLanguage.deleteMany({ where: { guideId: g.id } }),
    db.guideLanguage.createMany({ data: input.map((l) => ({ guideId: g.id, ...l })) }),
  ]);
}

export async function setServices(user: SessionUser, input: z.infer<typeof servicesSchema>) {
  const g = await getOrCreateGuideProfile(user);
  const existing = await db.service.findMany({ where: { guideId: g.id } });
  const keepIds = new Set(input.map((s) => s.id).filter(Boolean));
  // Los servicios quitados se desactivan (no se borran) para conservar el historial de reservas.
  await db.service.updateMany({ where: { guideId: g.id, id: { notIn: [...keepIds] as string[] } }, data: { active: false } });
  for (const s of input) {
    const data = {
      categoryId: s.categoryId,
      title: s.title,
      description: s.description,
      pricingType: s.pricingType,
      priceMinor: toMinor(s.price, g.currency),
      currency: g.currency,
      durationMin: s.durationMin,
      modality: s.modality,
      meetingPoint: s.meetingPoint || null,
      maxPeople: s.maxPeople,
      cityId: s.modality === "IN_PERSON" ? g.cityId : null,
      active: true,
    };
    const langs = [...new Set(s.languageIds)].map((languageId) => ({ languageId }));
    if (s.id && existing.some((e) => e.id === s.id)) {
      await db.service.update({ where: { id: s.id }, data: { ...data, languages: { deleteMany: {}, create: langs } } });
    } else {
      await db.service.create({ data: { ...data, guideId: g.id, languages: { create: langs } } });
    }
  }
}

export async function setAvailability(user: SessionUser, input: z.infer<typeof availabilitySchema>) {
  const g = await getOrCreateGuideProfile(user);
  await db.$transaction([
    db.availability.deleteMany({ where: { guideId: g.id } }),
    db.availability.createMany({ data: input.map((a) => ({ guideId: g.id, ...a })) }),
  ]);
}

export async function submitForVerification(user: SessionUser) {
  const g = await loadOwnProfile(user);
  const complete = g.displayName && g.cityId && g.languages.length && g.services.length && g.availability.length && g.idDocumentKey;
  if (!complete) throw badRequest("INCOMPLETE_PROFILE");
  if (g.status === "APPROVED") return g;
  return db.guideProfile.update({ where: { id: g.id }, data: { status: "PENDING", onboardingStep: 6, rejectionReason: null } });
}
