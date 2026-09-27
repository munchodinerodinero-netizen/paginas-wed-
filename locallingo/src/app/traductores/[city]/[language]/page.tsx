import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getI18n } from "@/i18n/server";
import { searchGuides } from "@/server/services/guides";
import { resolveSeoSegments } from "@/server/services/seo";
import { SeoLanding } from "@/components/SeoLanding";

type Props = { params: Promise<{ city: string; language: string }> };

async function load(city: string, language: string) {
  const { t, locale } = await getI18n();
  const target = await resolveSeoSegments([city, language], locale);
  if (!target?.city || !target.language) return null;
  const vars = { city: target.city.name, language: target.language.name };
  return { t, locale, target: target as Required<typeof target>, title: t("seo.translatorsTitle", vars), description: t("seo.translatorsDesc", vars) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, language } = await params;
  const data = await load(city, language);
  if (!data) return {};
  return { title: data.title, description: data.description, alternates: { canonical: `/traductores/${city}/${language}` } };
}

export default async function TranslatorsPage({ params }: Props) {
  const { city, language } = await params;
  const data = await load(city, language);
  if (!data) notFound();
  const { t, locale, target, title, description } = data;
  const guides = await searchGuides({ city: target.city.slug, language: target.language.code, category: "translation" }, locale);
  const fallback = guides.length ? guides : await searchGuides({ city: target.city.slug, language: target.language.code }, locale);
  return (
    <SeoLanding
      title={title}
      description={description}
      guides={fallback}
      crumbs={[
        { name: t("nav.explore"), href: "/explorar" },
        { name: target.city.name, href: `/guias/${target.city.countrySlug}/${target.city.slug}` },
        { name: target.language.name, href: `/traductores/${target.city.slug}/${target.language.slug}` },
      ]}
      exploreHref={`/explorar?city=${target.city.slug}&language=${target.language.code}&service=translation`}
      ctaLabel={t("nav.explore")}
    />
  );
}
