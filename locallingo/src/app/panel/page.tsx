import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDateTime, minutesToHHMM } from "@/lib/time";
import { intlLocale, weekdayNames } from "@/i18n/core";
import { getI18n } from "@/i18n/server";
import { getSessionUser, type SessionUser } from "@/server/auth";
import { getMoney } from "@/server/format";
import { guideEarnings, listGuideBookings, listTouristBookings } from "@/server/services/bookings";
import { ratingOf } from "@/server/services/guides";
import { ActionButton } from "@/components/ActionButton";
import { Avatar } from "@/components/Avatar";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata = { robots: { index: false } };

type SP = Promise<{ tab?: string; f?: string }>;

function Tabs({ tabs, active }: { tabs: { key: string; label: string }[]; active: string }) {
  return (
    <nav className="tabs">
      {tabs.map((tb) => <Link key={tb.key} href={`/panel?tab=${tb.key}`} className={tb.key === active ? "active" : ""}>{tb.label}</Link>)}
    </nav>
  );
}

function SubTabs({ tab, items, active }: { tab: string; items: { key: string; label: string; count: number }[]; active: string }) {
  return (
    <div className="row" style={{ marginBottom: 12 }}>
      {items.map((i) => (
        <Link key={i.key} href={`/panel?tab=${tab}&f=${i.key}`} className={`btn btn-sm ${i.key === active ? "btn-primary" : "btn-outline"}`}>
          {i.label} ({i.count})
        </Link>
      ))}
    </div>
  );
}

type BookingRow = Awaited<ReturnType<typeof listTouristBookings>>[number];

async function BookingTable({ rows, perspective }: { rows: BookingRow[]; perspective: "tourist" | "guide" }) {
  const { t, locale } = await getI18n();
  const money = await getMoney();
  if (!rows.length) return <p className="muted">{t("dashboard.empty")}</p>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>{t("common.date")}</th>
            <th>{t("booking.service")}</th>
            <th>{perspective === "tourist" ? t("booking.guide") : t("booking.tourist")}</th>
            <th>{t("common.amount")}</th>
            <th>{t("common.status")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id}>
              <td>{formatDateTime(b.startAt, intlLocale(locale), b.guide.city?.timezone)}</td>
              <td>{b.service.title}</td>
              <td>{perspective === "tourist" ? b.guide.displayName : b.tourist.name.split(" ")[0]}</td>
              <td>{money.fmt(perspective === "tourist" ? b.totalMinor : b.guideNetMinor, b.currency)}</td>
              <td><StatusBadge status={b.status} t={t} /></td>
              <td><Link href={`/reservas/${b.id}`} className="btn btn-outline btn-sm">{t("dashboard.view")}</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function TouristPanel({ user, tab, f }: { user: SessionUser; tab: string; f: string }) {
  const { t } = await getI18n();
  const money = await getMoney();
  const bookings = await listTouristBookings(user.id);
  const now = Date.now();
  const groups = {
    upcoming: bookings.filter((b) => ["PENDING_PAYMENT", "PENDING", "ACCEPTED"].includes(b.status) && b.startAt.getTime() > now - 86400_000),
    completed: bookings.filter((b) => b.status === "COMPLETED"),
    cancelled: bookings.filter((b) => ["CANCELLED", "REJECTED"].includes(b.status)),
  };
  const active = tab || "bookings";
  return (
    <>
      <Tabs
        active={active}
        tabs={[
          { key: "bookings", label: t("dashboard.myBookings") },
          { key: "favorites", label: t("dashboard.favorites") },
          { key: "payments", label: t("dashboard.payments") },
          { key: "profile", label: t("dashboard.profile") },
        ]}
      />
      {active === "bookings" && (
        <>
          <SubTabs
            tab="bookings"
            active={f || "upcoming"}
            items={(["upcoming", "completed", "cancelled"] as const).map((k) => ({ key: k, label: t(`dashboard.${k}`), count: groups[k].length }))}
          />
          <BookingTable rows={groups[(f as keyof typeof groups) || "upcoming"] ?? groups.upcoming} perspective="tourist" />
          <Link href="/explorar" className="btn btn-primary" style={{ marginTop: 16 }}>{t("dashboard.exploreCta")}</Link>
        </>
      )}
      {active === "favorites" && <Favorites userId={user.id} />}
      {active === "payments" && (
        <PaymentsTable userId={user.id} fmt={money.fmt} />
      )}
      {active === "profile" && <ProfileCard user={user} />}
    </>
  );
}

async function Favorites({ userId }: { userId: string }) {
  const { t } = await getI18n();
  const favs = await db.favorite.findMany({ where: { userId }, include: { guide: true } });
  if (!favs.length) return <p className="muted">{t("dashboard.noFavorites")}</p>;
  return (
    <div className="grid grid-3">
      {favs.map((f) => (
        <Link key={f.id} href={`/guia/${f.guide.slug}`} className="card row" style={{ color: "var(--ink)" }}>
          <Avatar name={f.guide.displayName} url={f.guide.photoUrl} size={48} />
          <div>
            <strong>{f.guide.displayName}</strong>
            <div className="small muted">{f.guide.headline}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

async function PaymentsTable({ userId, fmt }: { userId: string; fmt: (m: number, c: string) => string }) {
  const { t, locale } = await getI18n();
  const payments = await db.payment.findMany({ where: { booking: { touristId: userId } }, include: { booking: { select: { code: true, id: true } } }, orderBy: { createdAt: "desc" } });
  if (!payments.length) return <p className="muted">{t("dashboard.empty")}</p>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>{t("common.date")}</th><th>#</th><th>{t("common.amount")}</th><th>{t("common.status")}</th></tr></thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.createdAt.toLocaleDateString(intlLocale(locale))}</td>
              <td><Link href={`/reservas/${p.booking.id}`}>{p.booking.code}</Link></td>
              <td>{p.kind === "REFUND" ? "−" : ""}{fmt(p.amountMinor, p.currency)}</td>
              <td><span className="badge">{p.kind === "REFUND" ? t("booking.refund") : p.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function ProfileCard({ user }: { user: SessionUser }) {
  const { t } = await getI18n();
  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <div className="row"><Avatar name={user.name} size={56} /><div><strong>{user.name}</strong><div className="muted small">{user.email}</div></div></div>
      <p className="small muted" style={{ marginTop: 12 }}>{t("nav.language")}: {user.locale.toUpperCase()} · {t("nav.currency")}: {user.currency}</p>
    </div>
  );
}

async function GuidePanel({ user, tab, f }: { user: SessionUser; tab: string; f: string }) {
  const { t, locale } = await getI18n();
  const money = await getMoney();
  const guide = await db.guideProfile.findUnique({ where: { userId: user.id }, include: { availability: true, city: true } });
  if (!guide || guide.status === "DRAFT") {
    return (
      <div className="card">
        <p>{t("onboarding.title")}</p>
        <Link href="/ser-guia/registro" className="btn btn-primary">{t("onboarding.title")} →</Link>
      </div>
    );
  }
  const bookings = await listGuideBookings(guide.id);
  const earnings = await guideEarnings(guide.id);
  const payouts = await db.payout.findMany({ where: { guideId: guide.id }, orderBy: { createdAt: "desc" } });
  const now = Date.now();
  const groups = {
    pending: bookings.filter((b) => b.status === "PENDING"),
    accepted: bookings.filter((b) => b.status === "ACCEPTED"),
    completed: bookings.filter((b) => b.status === "COMPLETED"),
    cancelled: bookings.filter((b) => ["CANCELLED", "REJECTED"].includes(b.status)),
  };
  const upcoming = groups.accepted.filter((b) => b.startAt.getTime() > now).slice(0, 5);
  const fmt = (m: number) => money.fmt(m, guide.currency);
  const rating = ratingOf(guide);
  const active = tab || "summary";
  const days = weekdayNames(locale);
  const statusTone = guide.status === "APPROVED" ? "badge-ok" : guide.status === "REJECTED" ? "badge-bad" : "badge-warn";

  return (
    <>
      <div className="row between" style={{ marginBottom: 12 }}>
        <div className="row">
          <span className="muted small">{t("dashboard.profileStatus")}:</span>
          <span className={`badge ${statusTone}`}>{guide.status === "APPROVED" ? t("guide.verified") : guide.status === "PENDING" ? t("guide.pendingVerification") : guide.status}</span>
        </div>
        <div className="row">
          <Link href={`/guia/${guide.slug}`} className="btn btn-outline btn-sm">{t("guide.viewProfile")}</Link>
          <Link href="/ser-guia/registro" className="btn btn-outline btn-sm">{t("dashboard.editProfile")}</Link>
        </div>
      </div>
      {guide.status === "REJECTED" && guide.rejectionReason && <p className="notice notice-warn">{guide.rejectionReason}</p>}
      <Tabs
        active={active}
        tabs={[
          { key: "summary", label: t("dashboard.summary") },
          { key: "calendar", label: t("dashboard.calendar") },
          { key: "bookings", label: t("dashboard.bookings") },
          { key: "earnings", label: t("dashboard.earnings") },
        ]}
      />
      {active === "summary" && (
        <>
          <div className="grid grid-4">
            <div className="card"><div className="muted small">{t("dashboard.pending")}</div><div className="stat">{groups.pending.length}</div></div>
            <div className="card"><div className="muted small">{t("dashboard.nextServices")}</div><div className="stat">{upcoming.length}</div></div>
            <div className="card"><div className="muted small">{t("dashboard.available")}</div><div className="stat" style={{ fontSize: "1.2rem" }}>{fmt(earnings.available)}</div></div>
            <div className="card"><div className="muted small">{t("dashboard.rating")}</div><div className="stat">{rating != null ? `⭐ ${rating.toFixed(1)}` : "—"}</div></div>
          </div>
          {groups.pending.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3>{t("dashboard.pending")}</h3>
              <BookingTable rows={groups.pending} perspective="guide" />
            </div>
          )}
          <div style={{ marginTop: 20 }}>
            <h3>{t("dashboard.nextServices")}</h3>
            <BookingTable rows={upcoming} perspective="guide" />
          </div>
        </>
      )}
      {active === "calendar" && (
        <div className="grid grid-2">
          <div className="card">
            <h3>{t("guide.availability")}</h3>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const slots = guide.availability.filter((a) => a.weekday === d);
              return (
                <div key={d} className="row between small" style={{ borderBottom: "1px solid var(--border)", padding: "6px 0" }}>
                  <strong>{days[d]}</strong>
                  <span>{slots.length ? slots.map((s) => `${minutesToHHMM(s.startMinute)}–${minutesToHHMM(s.endMinute)}`).join(", ") : "—"}</span>
                </div>
              );
            })}
            <Link href="/ser-guia/registro?step=5" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>{t("dashboard.editProfile")}</Link>
          </div>
          <div className="card">
            <h3>{t("dashboard.nextServices")}</h3>
            {[...groups.pending, ...groups.accepted].filter((b) => b.startAt.getTime() > now).sort((a, b) => a.startAt.getTime() - b.startAt.getTime()).map((b) => (
              <div key={b.id} className="row between small" style={{ borderBottom: "1px solid var(--border)", padding: "6px 0" }}>
                <span>{formatDateTime(b.startAt, intlLocale(locale), guide.city?.timezone)}</span>
                <Link href={`/reservas/${b.id}`}>{b.service.title}</Link>
                <StatusBadge status={b.status} t={t} />
              </div>
            ))}
          </div>
        </div>
      )}
      {active === "bookings" && (
        <>
          <SubTabs
            tab="bookings"
            active={f || "pending"}
            items={(["pending", "accepted", "completed", "cancelled"] as const).map((k) => ({ key: k, label: t(`dashboard.${k}`), count: groups[k].length }))}
          />
          <BookingTable rows={groups[(f as keyof typeof groups) || "pending"] ?? groups.pending} perspective="guide" />
        </>
      )}
      {active === "earnings" && (
        <>
          <div className="grid grid-4">
            <div className="card"><div className="muted small">{t("dashboard.gross")}</div><div className="stat" style={{ fontSize: "1.2rem" }}>{fmt(earnings.gross)}</div></div>
            <div className="card"><div className="muted small">{t("dashboard.commission")}</div><div className="stat" style={{ fontSize: "1.2rem" }}>−{fmt(earnings.commission)}</div></div>
            <div className="card"><div className="muted small">{t("dashboard.net")}</div><div className="stat" style={{ fontSize: "1.2rem" }}>{fmt(earnings.net)}</div></div>
            <div className="card"><div className="muted small">{t("dashboard.available")}</div><div className="stat" style={{ fontSize: "1.2rem" }}>{fmt(earnings.available)}</div></div>
          </div>
          <div style={{ marginTop: 16 }}>
            {earnings.available > 0 && <ActionButton path="/guide/payouts" label={t("dashboard.requestPayout")} className="btn btn-primary" />}
          </div>
          <h3 style={{ marginTop: 20 }}>{t("dashboard.payouts")}</h3>
          {payouts.length ? (
            <table className="table">
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id}><td>{p.createdAt.toLocaleDateString(intlLocale(locale))}</td><td>{fmt(p.amountMinor)}</td><td><span className="badge">{p.status}</span></td></tr>
                ))}
              </tbody>
            </table>
          ) : <p className="muted">{t("dashboard.empty")}</p>}
        </>
      )}
    </>
  );
}

export default async function PanelPage({ searchParams }: { searchParams: SP }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/panel");
  if (user.role === "ADMIN") redirect("/admin");
  const { t } = await getI18n();
  const { tab = "", f = "" } = await searchParams;
  return (
    <div className="container" style={{ padding: "24px 16px 64px" }}>
      <h1 style={{ fontSize: "1.6rem" }}>{t("dashboard.title")}</h1>
      {user.role === "GUIDE" ? <GuidePanel user={user} tab={tab} f={f} /> : <TouristPanel user={user} tab={tab} f={f} />}
    </div>
  );
}
