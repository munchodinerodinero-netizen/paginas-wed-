import Link from "next/link";
import { getI18n } from "@/i18n/server";
import { weekdayNames } from "@/i18n/core";
import { getCatalog } from "@/server/services/catalog";
import { searchGuides } from "@/server/services/guides";
import { getMoney } from "@/server/format";
import { GuideCard } from "@/components/GuideCard";

const CATEGORY_ORDER = ["translation", "local-guide", "companion", "experiences", "business"];

export default async function Home() {
  const { t, locale } = await getI18n();
  const catalog = await getCatalog(locale);
  const featured = await searchGuides({ limit: 3 }, locale);
  const money = await getMoney();
  const icons = Object.fromEntries(catalog.categories.map((c) => [c.slug, c.icon]));

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>{t("hero.title")}</h1>
          <p>{t("hero.subtitle")}</p>
          <form className="search-box" action="/explorar" method="get">
            <div>
              <label htmlFor="city">{t("hero.where")}</label>
              <select id="city" name="city" defaultValue="mazatlan">
                <option value="">{t("hero.any")}</option>
                {catalog.cities.map((c) => <option key={c.id} value={c.slug}>{c.name}, {c.country}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="language">{t("hero.whichLanguage")}</label>
              <select id="language" name="language" defaultValue={locale === "en" ? "en" : ""}>
                <option value="">{t("hero.any")}</option>
                {catalog.languages.map((l) => <option key={l.id} value={l.code}>{l.flag} {l.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="service">{t("hero.whatNeed")}</label>
              <select id="service" name="service">
                <option value="">{t("hero.any")}</option>
                {catalog.categories.map((c) => <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" type="submit">{t("hero.search")}</button>
          </form>
        </div>
      </section>

      <section className="section container">
        <h2>{t("categories.title")}</h2>
        <div className="grid grid-3" style={{ marginTop: 16 }}>
          {CATEGORY_ORDER.map((slug) => (
            <Link key={slug} href={`/explorar?service=${slug}`} className="card category-card">
              <div className="category-icon" aria-hidden>{icons[slug]}</div>
              <h3>{t(`categories.${slug}.name`)}</h3>
              <p className="muted small" style={{ margin: 0 }}>{t(`categories.${slug}.desc`)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <h2>{t("how.title")}</h2>
          <div className="grid grid-2" style={{ marginTop: 16 }}>
            {(["tourists", "guides"] as const).map((who) => (
              <div key={who}>
                <h3 className="muted">{t(`how.${who}`)}</h3>
                <div className="stack">
                  {[1, 2, 3].map((n) => {
                    const k = `${who === "tourists" ? "t" : "g"}${n}`;
                    return (
                      <div key={k} className="card card-flat row" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                        <div className="step-num">{n}</div>
                        <div>
                          <strong>{t(`how.${k}.title`)}</strong>
                          <div className="muted small">{t(`how.${k}.desc`)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section container">
          <div className="row between">
            <h2>{t("featured.title")}</h2>
            <Link href="/explorar">{t("nav.explore")} →</Link>
          </div>
          <div className="grid grid-3" style={{ marginTop: 16 }}>
            {featured.map((g) => <GuideCard key={g.id} g={g} t={t} price={money.withApprox} weekdays={weekdayNames(locale)} />)}
          </div>
        </section>
      )}

      <section className="section container">
        <div className="grid grid-3">
          {["verified", "payments", "reviews"].map((k, i) => (
            <div key={k} className="card card-flat">
              <div className="category-icon" aria-hidden>{["🪪", "🔒", "⭐"][i]}</div>
              <strong>{t(`trust.${k}`)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="card center" style={{ padding: 32 }}>
          <h2>{t("cta.guideTitle")}</h2>
          <p className="muted">{t("cta.guideDesc")}</p>
          <Link href="/ser-guia" className="btn btn-primary">{t("cta.guideButton")}</Link>
        </div>
      </section>
    </>
  );
}
