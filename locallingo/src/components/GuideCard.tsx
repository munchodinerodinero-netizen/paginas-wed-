import Link from "next/link";
import type { GuideCard as Card } from "@/server/services/guides";
import type { TFunction } from "@/i18n/core";
import { Avatar } from "./Avatar";

export function GuideCard({ g, t, price, weekdays }: { g: Card; t: TFunction; price: (minor: number, currency: string) => string; weekdays: string[] }) {
  const days = g.availableWeekdays.map((d) => weekdays[d]).join(", ");
  return (
    <article className="card guide-card">
      <div className="guide-card-top">
        <Avatar name={g.displayName} url={g.photoUrl} size={64} />
        <div>
          <h3 style={{ margin: 0 }}>
            {g.displayName} {g.verified && <span className="badge badge-ok">✓ {t("guide.verified")}</span>}
          </h3>
          <div className="muted small">📍 {g.city}{g.country ? `, ${g.country}` : ""}</div>
          <div className="small">
            {g.rating != null ? (
              <span className="rating">⭐ {g.rating.toFixed(1)} <span className="muted">({g.reviewCount === 1 ? t("guide.reviewOne") : t("guide.reviews", { count: g.reviewCount })})</span></span>
            ) : (
              <span className="badge">{t("guide.noReviews")}</span>
            )}
          </div>
        </div>
      </div>
      <div className="small">
        {g.languages.map((l) => (
          <div key={l.code}>{l.flag} {l.name} {t(`levels.${l.level}`)}</div>
        ))}
      </div>
      {g.headline && <p className="small" style={{ margin: 0 }}>“{g.headline}”</p>}
      <div>{g.categories.map((c) => <span key={c} className="chip">{c}</span>)}</div>
      {days && <div className="small muted">🗓️ {t("guide.availableOn", { days })}</div>}
      <div className="row between" style={{ marginTop: "auto" }}>
        {g.fromPriceMinor != null && (
          <span className="price small">
            {t("guide.from")} {price(g.fromPriceMinor, g.currency)}{g.fromIsHourly ? t("guide.perHour") : ""}
          </span>
        )}
        <Link className="btn btn-outline btn-sm" href={`/guia/${g.slug}`}>{t("guide.viewProfile")}</Link>
      </div>
    </article>
  );
}
