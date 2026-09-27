import "server-only";
import { db } from "@/lib/db";
import { localized } from "@/lib/i18n-data";

export type SeoTarget = { country?: { slug: string; name: string }; city?: { slug: string; name: string; countrySlug: string; countryName: string }; language?: { slug: string; code: string; name: string } };

/**
 * Resuelve URLs amigables:
 *   /guias/mexico/mazatlan · /guias/mazatlan/ingles · /guias/japon/tokio/espanol · /guias/mexico
 */
export async function resolveSeoSegments(segments: string[], locale: string): Promise<SeoTarget | null> {
  if (!segments.length || segments.length > 3) return null;
  const out: SeoTarget = {};
  const rest = [...segments];

  const country = await db.country.findUnique({ where: { slug: rest[0] } });
  if (country) {
    out.country = { slug: country.slug, name: localized(country.names, locale) };
    rest.shift();
  }
  if (rest[0]) {
    const city = await db.city.findUnique({ where: { slug: rest[0] }, include: { country: true } });
    if (city && city.active && (!country || city.countryId === country.id)) {
      out.city = { slug: city.slug, name: localized(city.names, locale), countrySlug: city.country.slug, countryName: localized(city.country.names, locale) };
      rest.shift();
    }
  }
  if (rest[0]) {
    const lang = await db.language.findUnique({ where: { slug: rest[0] } });
    if (lang && lang.active) {
      out.language = { slug: lang.slug, code: lang.code, name: localized(lang.names, locale) };
      rest.shift();
    }
  }
  if (rest.length || (!out.city && !out.country)) return null;
  return out;
}

/** Todas las combinaciones indexables con al menos un guía aprobado (para el sitemap). */
export async function seoCombinations() {
  const guides = await db.guideProfile.findMany({
    where: { status: "APPROVED" },
    select: { slug: true, updatedAt: true, city: { select: { slug: true, country: { select: { slug: true } } } }, languages: { select: { language: { select: { slug: true } } } } },
  });
  const paths = new Set<string>();
  for (const g of guides) {
    if (!g.city) continue;
    const { slug: city, country } = g.city;
    paths.add(`/guias/${country.slug}`);
    paths.add(`/guias/${country.slug}/${city}`);
    for (const l of g.languages) {
      paths.add(`/guias/${city}/${l.language.slug}`);
      paths.add(`/guias/${country.slug}/${city}/${l.language.slug}`);
      paths.add(`/traductores/${city}/${l.language.slug}`);
    }
  }
  return { paths: [...paths], guides };
}
