import "server-only";
import { db } from "@/lib/db";
import { localized } from "@/lib/i18n-data";

export async function getCatalog(locale: string, includeInactive = false) {
  const where = includeInactive ? {} : { active: true };
  const [countries, cities, languages, categories] = await Promise.all([
    db.country.findMany(),
    db.city.findMany({ where, include: { country: true } }),
    db.language.findMany({ where }),
    db.category.findMany({ where }),
  ]);
  const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name, locale);
  return {
    countries: countries.map((c) => ({ id: c.id, code: c.code, slug: c.slug, name: localized(c.names, locale) })).sort(byName),
    cities: cities
      .map((c) => ({ id: c.id, slug: c.slug, countryId: c.countryId, countrySlug: c.country.slug, country: localized(c.country.names, locale), name: localized(c.names, locale), active: c.active, timezone: c.timezone }))
      .sort(byName),
    languages: languages.map((l) => ({ id: l.id, code: l.code, slug: l.slug, flag: l.flag, name: localized(l.names, locale), active: l.active })).sort(byName),
    categories: categories.map((c) => ({ id: c.id, slug: c.slug, icon: c.icon, name: localized(c.names, locale), active: c.active, commissionBps: c.commissionBps })),
  };
}
export type Catalog = Awaited<ReturnType<typeof getCatalog>>;
