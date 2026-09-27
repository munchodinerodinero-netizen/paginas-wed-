import type { Metadata } from "next";
import Link from "next/link";
import { getI18n } from "@/i18n/server";
import { getCatalog } from "@/server/services/catalog";
import { searchGuides } from "@/server/services/guides";
import { parseSearchParams, recordSearch } from "@/server/services/search-params";
import { GuideResults } from "@/components/GuideResults";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("explore.title"), robots: { index: false, follow: true } };
}

type SP = Record<string, string | string[] | undefined>;

export default async function Explore({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { t, locale } = await getI18n();
  const catalog = await getCatalog(locale);
  const filters = parseSearchParams(sp);
  const guides = await searchGuides(filters, locale);
  await recordSearch(filters, guides.length);
  const v = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");

  return (
    <div className="container explore-layout">
      <aside>
        <details className="card filters" open>
          <summary>{t("explore.filters")}</summary>
          <form method="get" action="/explorar" style={{ marginTop: 12 }}>
            <div className="field">
              <label htmlFor="city">{t("explore.destination")}</label>
              <select id="city" name="city" defaultValue={v("city")}>
                <option value="">{t("hero.any")}</option>
                {catalog.cities.map((c) => <option key={c.id} value={c.slug}>{c.name}, {c.country}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="language">{t("explore.language")}</label>
              <select id="language" name="language" defaultValue={v("language")}>
                <option value="">{t("hero.any")}</option>
                {catalog.languages.map((l) => <option key={l.id} value={l.code}>{l.flag} {l.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="service">{t("explore.service")}</label>
              <select id="service" name="service" defaultValue={v("service")}>
                <option value="">{t("hero.any")}</option>
                {catalog.categories.map((c) => <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="row" style={{ flexWrap: "nowrap" }}>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="minPrice">{t("explore.minPrice")} (MXN)</label>
                <input id="minPrice" name="minPrice" inputMode="decimal" defaultValue={v("minPrice")} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="maxPrice">{t("explore.maxPrice")} (MXN)</label>
                <input id="maxPrice" name="maxPrice" inputMode="decimal" defaultValue={v("maxPrice")} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="date">{t("explore.date")}</label>
              <input id="date" type="date" name="date" defaultValue={v("date")} />
            </div>
            <div className="row" style={{ flexWrap: "nowrap" }}>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="duration">{t("explore.duration")}</label>
                <input id="duration" name="duration" type="number" min="1" max="24" defaultValue={v("duration")} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="rating">{t("explore.rating")}</label>
                <select id="rating" name="rating" defaultValue={v("rating")}>
                  <option value="">—</option>
                  {[4.5, 4, 3].map((r) => <option key={r} value={r}>⭐ {r}+</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="modality">{t("explore.modality")}</label>
              <select id="modality" name="modality" defaultValue={v("modality")}>
                <option value="">{t("hero.any")}</option>
                <option value="IN_PERSON">{t("explore.inPerson")}</option>
                <option value="REMOTE">{t("explore.remote")}</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="sort">{t("explore.sort")}</label>
              <select id="sort" name="sort" defaultValue={v("sort") || "relevance"}>
                <option value="relevance">{t("explore.sortRelevance")}</option>
                <option value="price_asc">{t("explore.sortPriceAsc")}</option>
                <option value="price_desc">{t("explore.sortPriceDesc")}</option>
                <option value="rating">{t("explore.sortRating")}</option>
                <option value="popular">{t("explore.sortPopular")}</option>
                <option value="new">{t("explore.sortNew")}</option>
              </select>
            </div>
            <button className="btn btn-primary btn-block" type="submit">{t("explore.apply")}</button>
            <Link href="/explorar" className="btn btn-ghost btn-block">{t("explore.clear")}</Link>
          </form>
        </details>
      </aside>
      <section>
        <h1 style={{ fontSize: "1.6rem" }}>{t("explore.title")}</h1>
        <p className="muted">{t("explore.results", { count: guides.length })}</p>
        <GuideResults guides={guides} />
      </section>
    </div>
  );
}
