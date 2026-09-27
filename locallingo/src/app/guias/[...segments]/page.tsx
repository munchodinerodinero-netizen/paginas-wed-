import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getI18n } from "@/i18n/server";
import { searchGuides } from "@/server/services/guides";
import { resolveSeoSegments } from "@/server/services/seo";
import { SeoLanding } from "@/components/SeoLanding";

type Props = { params: Promise<{ segments: string[] }> };

async function load(segments: string[]) {
  const { t, locale } = await getI18n();
  const target = await resolveSeoSegments(segments, locale);
  if (!target) return null;
  const place = target.city?.name ?? target.country!.name;
  const title = target.language ? t("seo.cityLangTitle", { city: place, language: target.language.name }) : t("seo.cityTitle", { city: place });
  const description = target.language ? t("seo.cityLangDesc", { city: place, language: target.language.name }) : t("seo.cityDesc", { city: place });
  // URL canónica: /guias/{pais}/{ciudad}[/{idioma}] para evitar contenido duplicado.
  const countrySlug = target.city?.countrySlug ?? target.country!.slug;
  const canonical = ["/guias", countrySlug, target.city?.slug, target.language?.slug].filter(Boolean).join("/");
  return { t, locale, target, title, description, canonical, countrySlug };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).segments);
  if (!data) return {};
  return { title: data.title, description: data.description, alternates: { canonical: data.canonical }, openGraph: { title: data.title, description: data.description } };
}

export default async function SeoGuidesPage({ params }: Props) {
  const data = await load((await params).segments);
  if (!data) notFound();
  const { t, locale, target, title, description, countrySlug } = data;
  const guides = await searchGuides({ city: target.city?.slug, country: target.city ? undefined : target.country?.slug, language: target.language?.code }, locale);
  const crumbs = [{ name: t("nav.explore"), href: "/explorar" }, { name: target.city?.countryName ?? target.country!.name, href: `/guias/${countrySlug}` }];
  if (target.city) crumbs.push({ name: target.city.name, href: `/guias/${countrySlug}/${target.city.slug}` });
  if (target.language && target.city) crumbs.push({ name: target.language.name, href: `/guias/${countrySlug}/${target.city.slug}/${target.language.slug}` });
  const q = new URLSearchParams({ ...(target.city && { city: target.city.slug }), ...(target.language && { language: target.language.code }) });
  return <SeoLanding title={title} description={description} guides={guides} crumbs={crumbs} exploreHref={`/explorar?${q}`} ctaLabel={t("nav.explore")} />;
}
