import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { db } from "@/lib/db";
import { minutesToHHMM } from "@/lib/time";
import { weekdayNames } from "@/i18n/core";
import { getI18n } from "@/i18n/server";
import { getSessionUser } from "@/server/auth";
import { getMoney } from "@/server/format";
import { getGuideBySlug, getGuideReviews, publicGuide } from "@/server/services/guides";
import { Avatar } from "@/components/Avatar";
import { Stars } from "@/components/Stars";
import { BookingWidget } from "@/components/BookingWidget";
import { GuideActions } from "@/components/GuideActions";
import { ReportForm } from "@/components/ReportForm";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const g = await getGuideBySlug(slug);
  if (!g) return null;
  const user = await getSessionUser();
  const isOwner = user?.id === g.userId;
  // Perfiles no aprobados solo los ve su dueño o un admin.
  if (g.status !== "APPROVED" && !isOwner && user?.role !== "ADMIN") return null;
  return { g, user, isOwner };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return {};
  const { locale } = await getI18n();
  const pg = publicGuide(data.g, locale);
  return {
    title: `${pg.displayName} — ${pg.headline || pg.city}`,
    description: pg.bio.slice(0, 155),
    alternates: { canonical: `/guia/${slug}` },
    robots: data.g.status === "APPROVED" ? undefined : { index: false },
  };
}

export default async function GuideProfilePage({ params }: Props) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { g, user, isOwner } = data;
  const { t, locale } = await getI18n();
  const money = await getMoney();
  const guide = publicGuide(g, locale);
  const reviews = await getGuideReviews(g.userId);
  const days = weekdayNames(locale);
  const favorite = user ? !!(await db.favorite.findUnique({ where: { userId_guideId: { userId: user.id, guideId: g.id } } })) : false;

  const subRatings = await db.review.aggregate({
    where: { targetUserId: g.userId, direction: "TOURIST_TO_GUIDE", hidden: false },
    _avg: { communication: true, punctuality: true, knowledge: true, experience: true },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: guide.displayName,
    jobTitle: guide.headline,
    address: { "@type": "PostalAddress", addressLocality: guide.city, addressCountry: guide.country },
    knowsLanguage: guide.languages.map((l) => l.code),
    url: `${brand.domain}/guia/${guide.slug}`,
    ...(guide.rating != null && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: guide.rating, reviewCount: guide.reviewCount, bestRating: 5 },
    }),
  };

  return (
    <div className="container profile-layout">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="stack">
        <div className="card">
          <div className="row" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
            <Avatar name={guide.displayName} url={guide.photoUrl} size={96} />
            <div>
              <h1 style={{ fontSize: "1.8rem", marginBottom: 4 }}>{guide.displayName}</h1>
              <div className="muted">📍 {guide.city}, {guide.country}</div>
              <div className="row small" style={{ marginTop: 6 }}>
                {guide.status === "APPROVED" && guide.verified ? (
                  <span className="badge badge-ok">✓ {t("guide.verified")}</span>
                ) : (
                  <span className="badge badge-warn">{t("guide.pendingVerification")}</span>
                )}
                {guide.rating != null && <span><Stars value={guide.rating} /> {guide.rating.toFixed(1)} ({guide.reviewCount === 1 ? t("guide.reviewOne") : t("guide.reviews", { count: guide.reviewCount })})</span>}
                {guide.completedBookings > 0 && <span className="muted">{t("guide.completed", { n: guide.completedBookings })}</span>}
              </div>
              {guide.headline && <p style={{ marginTop: 8 }}>“{guide.headline}”</p>}
            </div>
          </div>
          {!isOwner && guide.status === "APPROVED" && (
            <div style={{ marginTop: 12 }}>
              <GuideActions guideId={guide.id} slug={guide.slug} loggedIn={!!user} favorite={favorite} />
            </div>
          )}
        </div>

        <div className="card">
          <h2>{t("guide.languages")}</h2>
          {guide.languages.map((l) => <div key={l.code}>{l.flag} {l.name} — <strong>{t(`levels.${l.level}`)}</strong></div>)}
        </div>

        {guide.bio && (
          <div className="card">
            <h2>{t("guide.about")}</h2>
            <p style={{ whiteSpace: "pre-line" }}>{guide.bio}</p>
            {guide.experience && (
              <>
                <h3>{t("guide.experience")}</h3>
                <p style={{ whiteSpace: "pre-line" }}>{guide.experience}</p>
              </>
            )}
          </div>
        )}

        <div className="card">
          <h2>{t("guide.services")}</h2>
          <div className="stack">
            {guide.services.map((s) => (
              <div key={s.id} className="card card-flat">
                <div className="row between">
                  <h3 style={{ margin: 0 }}>{s.title}</h3>
                  <span className="price">
                    {money.withApprox(s.priceMinor, s.currency)} <span className="muted small">{s.pricingType === "HOURLY" ? t("guide.perHourLong") : t("guide.perService")}</span>
                  </span>
                </div>
                <div className="small muted">
                  {s.category} · ⏱️ {s.durationMin % 60 === 0 ? t("guide.hours", { n: s.durationMin / 60 }) : t("guide.minutes", { n: s.durationMin })} · {t(`modality.${s.modality}`)} · 👥 {t("guide.maxPeople", { n: s.maxPeople })}
                </div>
                <div className="small">🗣️ {s.languages.join(" / ")}</div>
                {s.description && <p className="small" style={{ margin: "6px 0 0" }}>{s.description}</p>}
                {s.meetingPoint && <div className="small muted">📌 {s.meetingPoint}</div>}
              </div>
            ))}
          </div>
        </div>

        {guide.photos.length > 0 && (
          <div className="card">
            <h2>{t("guide.photos")}</h2>
            <div className="gallery">{guide.photos.map((p) => <img key={p} src={p} alt={guide.displayName} loading="lazy" />)}</div>
          </div>
        )}

        <div className="card">
          <h2>{t("guide.availability")}</h2>
          <div className="small">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const slots = guide.availability.filter((a) => a.weekday === d);
              return (
                <div key={d} className="row between" style={{ borderBottom: "1px solid var(--border)", padding: "6px 0" }}>
                  <strong>{days[d]}</strong>
                  <span className={slots.length ? "" : "muted"}>{slots.length ? slots.map((s) => `${minutesToHHMM(s.startMinute)}–${minutesToHHMM(s.endMinute)}`).join(", ") : "—"}</span>
                </div>
              );
            })}
          </div>
          {guide.cityCoords && (
            <>
              <h3 style={{ marginTop: 16 }}>{t("guide.location")}</h3>
              {/* Mapa del área de la ciudad, nunca la dirección particular del guía. */}
              <iframe
                className="map"
                title={guide.city}
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${guide.cityCoords.lng - 0.08}%2C${guide.cityCoords.lat - 0.05}%2C${guide.cityCoords.lng + 0.08}%2C${guide.cityCoords.lat + 0.05}&layer=mapnik`}
              />
            </>
          )}
        </div>

        <div className="card">
          <h2>{t("guide.ratings")}</h2>
          {guide.rating != null && (
            <div className="grid grid-4 small" style={{ marginBottom: 12 }}>
              {(["communication", "punctuality", "knowledge", "experience"] as const).map((k) => (
                <div key={k}>
                  <div className="muted">{t(`ratings.${k}`)}</div>
                  <strong>{subRatings._avg[k]?.toFixed(1) ?? "—"}</strong>
                </div>
              ))}
            </div>
          )}
          {reviews.length === 0 && <p className="muted">{t("guide.noReviews")}</p>}
          <div className="stack">
            {reviews.map((r) => (
              <div key={r.id} style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                <div className="row between small">
                  <strong>{r.author.name.split(" ")[0]}</strong>
                  <span><Stars value={r.rating} /> <span className="muted">{r.createdAt.toLocaleDateString(locale)}</span></span>
                </div>
                {r.comment && <p className="small" style={{ margin: "4px 0 0" }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>{t("guide.cancellationPolicy")}</h2>
          <p className="small" style={{ margin: 0 }}>{t(`policies.${guide.cancellationPolicy}`)}</p>
        </div>
        {user && !isOwner && <ReportForm target={{ guideId: guide.id }} label={t("guide.report")} />}
      </div>

      <aside>
        {guide.status === "APPROVED" && (
          <BookingWidget guide={guide} loggedIn={!!user} isTourist={user?.role === "TOURIST"} />
        )}
      </aside>
    </div>
  );
}
