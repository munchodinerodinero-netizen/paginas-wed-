import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/time";
import { intlLocale } from "@/i18n/core";
import { getI18n } from "@/i18n/server";
import { getSessionUser } from "@/server/auth";
import { getMoney } from "@/server/format";
import { getStats } from "@/server/services/admin";
import { getCatalog } from "@/server/services/catalog";
import { getCommissionBps } from "@/server/services/settings";
import { ActionButton } from "@/components/ActionButton";
import { CatalogForm, CommissionForm } from "@/components/AdminForms";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata = { robots: { index: false } };

const TABS = ["dashboard", "users", "guides", "bookings", "payments", "reports", "catalog", "settings"] as const;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string; role?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");
  const { t, locale } = await getI18n();
  const money = await getMoney();
  const { tab = "dashboard", role } = await searchParams;
  const loc = intlLocale(locale);
  const label: Record<string, string> = {
    dashboard: t("dashboard.summary"), users: t("admin.users"), guides: t("admin.guides"), bookings: t("admin.bookings"),
    payments: t("admin.payments"), reports: t("admin.reports"), catalog: `${t("admin.cities")} / ${t("admin.languages")}`, settings: t("admin.settings"),
  };

  return (
    <div className="container" style={{ padding: "24px 16px 64px" }}>
      <h1 style={{ fontSize: "1.6rem" }}>{t("admin.title")}</h1>
      <nav className="tabs">
        {TABS.map((k) => <Link key={k} href={`/admin?tab=${k}`} className={k === tab ? "active" : ""}>{label[k]}</Link>)}
      </nav>

      {tab === "dashboard" && <Dashboard />}
      {tab === "users" && <Users />}
      {tab === "guides" && <Guides />}
      {tab === "bookings" && <Bookings />}
      {tab === "payments" && <Payments />}
      {tab === "reports" && <Reports />}
      {tab === "catalog" && <CatalogAdmin />}
      {tab === "settings" && <CommissionForm bps={await getCommissionBps()} />}
    </div>
  );

  async function Dashboard() {
    const s = await getStats();
    const mxn = s.revenue.find((r) => r.currency === "MXN");
    const cards: [string, string | number][] = [
      [t("admin.users"), s.users],
      [t("admin.tourists"), s.tourists],
      [t("admin.guides"), s.guides],
      [t("admin.activeGuides"), s.activeGuides],
      [t("admin.bookings"), s.bookings],
      [t("admin.completedBookings"), s.completed],
      [t("admin.cancellations"), s.cancellations],
      [t("admin.reports"), s.openReports],
      [t("admin.revenue"), money.fmt(mxn?.gmvMinor ?? 0, "MXN")],
      [t("admin.commissions"), money.fmt(mxn?.commissionMinor ?? 0, "MXN")],
      [t("admin.avgBooking"), money.fmt(mxn?.avgMinor ?? 0, "MXN")],
      [t("admin.returning"), `${s.returningPct}%`],
      [t("admin.avgRating"), s.avgRating != null ? `⭐ ${s.avgRating}` : "—"],
      [t("admin.conversion"), `${s.conversionPct}%`],
      [t("admin.pendingGuides"), s.pendingGuides],
    ];
    return (
      <>
        <div className="grid grid-4">
          {cards.map(([k, v]) => (
            <div key={k} className="card"><div className="muted small">{k}</div><div className="stat" style={{ fontSize: "1.3rem" }}>{v}</div></div>
          ))}
        </div>
        <h2 style={{ marginTop: 24 }}>{t("admin.pendingGuides")}</h2>
        <PendingGuides />
      </>
    );
  }

  async function PendingGuides() {
    const pending = await db.guideProfile.findMany({ where: { status: "PENDING" }, include: { user: true, city: true, languages: { include: { language: true } } } });
    if (!pending.length) return <p className="muted">{t("admin.none")}</p>;
    return (
      <div className="stack">
        {pending.map((g) => (
          <div key={g.id} className="card row between">
            <div>
              <strong>{g.displayName}</strong> <span className="muted small">{g.user.email}</span>
              <div className="small">{g.headline}</div>
              <div className="small muted">{g.languages.map((l) => `${l.language.flag} ${t(`levels.${l.level}`)}`).join(" · ")}</div>
              <div className="small">{t("admin.documents")}: {g.idDocumentKey ? "🪪 ID ✓" : "—"} {g.legalDocumentKey ? "· 📄 ✓" : ""}</div>
            </div>
            <div className="row">
              <Link href={`/guia/${g.slug}`} className="btn btn-outline btn-sm">{t("guide.viewProfile")}</Link>
              <ActionButton path={`/admin/guides/${g.id}`} body={{ approve: true }} label={t("admin.approve")} className="btn btn-primary btn-sm" />
              <ActionButton path={`/admin/guides/${g.id}`} body={{ approve: false }} label={t("admin.reject")} className="btn btn-danger btn-sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  async function Users() {
    const users = await db.user.findMany({ where: role ? { role } : undefined, orderBy: { createdAt: "desc" }, take: 200 });
    return (
      <>
        <div className="row" style={{ marginBottom: 12 }}>
          {["", "TOURIST", "GUIDE", "ADMIN"].map((r) => (
            <Link key={r} href={`/admin?tab=users${r ? `&role=${r}` : ""}`} className={`btn btn-sm ${(role ?? "") === r ? "btn-primary" : "btn-outline"}`}>{r || "ALL"}</Link>
          ))}
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>{t("common.name")}</th><th>{t("common.email")}</th><th>{t("common.role")}</th><th>{t("common.status")}</th><th>{t("common.date")}</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                  <td><span className={`badge ${u.status === "ACTIVE" ? "badge-ok" : "badge-bad"}`}>{u.status}</span></td>
                  <td>{u.createdAt.toLocaleDateString(loc)}</td>
                  <td>
                    {u.id !== user!.id && (u.status === "ACTIVE"
                      ? <ActionButton path={`/admin/users/${u.id}`} body={{ status: "SUSPENDED" }} label={t("admin.suspend")} className="btn btn-danger btn-sm" />
                      : <ActionButton path={`/admin/users/${u.id}`} body={{ status: "ACTIVE" }} label={t("admin.reactivate")} />)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  async function Guides() {
    const guides = await db.guideProfile.findMany({ include: { user: true, city: true }, orderBy: { createdAt: "desc" } });
    return (
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>{t("common.name")}</th><th>{t("common.email")}</th><th>{t("common.status")}</th><th>⭐</th><th>{t("admin.completedBookings")}</th><th></th></tr></thead>
          <tbody>
            {guides.map((g) => (
              <tr key={g.id}>
                <td><Link href={`/guia/${g.slug}`}>{g.displayName}</Link></td>
                <td>{g.user.email}</td>
                <td><span className={`badge ${g.status === "APPROVED" ? "badge-ok" : g.status === "REJECTED" ? "badge-bad" : "badge-warn"}`}>{g.status}</span></td>
                <td>{g.ratingCount ? (g.ratingSum / g.ratingCount).toFixed(1) : "—"}</td>
                <td>{g.completedBookings}</td>
                <td className="row">
                  {g.status !== "APPROVED" && <ActionButton path={`/admin/guides/${g.id}`} body={{ approve: true }} label={t("admin.approve")} />}
                  {g.status !== "REJECTED" && <ActionButton path={`/admin/guides/${g.id}`} body={{ approve: false }} label={t("admin.reject")} className="btn btn-danger btn-sm" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  async function Bookings() {
    const bookings = await db.booking.findMany({ include: { service: true, guide: { include: { city: true } }, tourist: true }, orderBy: { createdAt: "desc" }, take: 200 });
    return (
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>#</th><th>{t("common.date")}</th><th>{t("booking.guide")}</th><th>{t("booking.tourist")}</th><th>{t("booking.total")}</th><th>{t("admin.commissions")}</th><th>{t("common.status")}</th></tr></thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td><Link href={`/reservas/${b.id}`}>{b.code}</Link></td>
                <td>{formatDateTime(b.startAt, loc, b.guide.city?.timezone)}</td>
                <td>{b.guide.displayName}</td>
                <td>{b.tourist.name}</td>
                <td>{money.fmt(b.totalMinor, b.currency)}</td>
                <td>{money.fmt(b.commissionMinor, b.currency)}</td>
                <td><StatusBadge status={b.status} t={t} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  async function Payments() {
    const [payments, payouts] = await Promise.all([
      db.payment.findMany({ include: { booking: true }, orderBy: { createdAt: "desc" }, take: 200 }),
      db.payout.findMany({ include: { guide: true }, orderBy: { createdAt: "desc" } }),
    ]);
    return (
      <>
        <h2>{t("admin.payouts")}</h2>
        {!payouts.length && <p className="muted">{t("admin.none")}</p>}
        <div className="table-wrap">
          <table className="table">
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td>{p.createdAt.toLocaleDateString(loc)}</td><td>{p.guide.displayName}</td><td>{money.fmt(p.amountMinor, p.currency)}</td>
                  <td><span className="badge">{p.status}</span></td>
                  <td>{p.status === "REQUESTED" && <ActionButton path={`/admin/payouts/${p.id}`} label={t("admin.markPaid")} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 style={{ marginTop: 24 }}>{t("admin.payments")}</h2>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>{t("common.date")}</th><th>#</th><th>Provider</th><th>{t("common.amount")}</th><th>{t("common.status")}</th></tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.createdAt.toLocaleDateString(loc)}</td><td>{p.booking.code}</td><td>{p.provider}</td>
                  <td>{p.kind === "REFUND" ? "−" : ""}{money.fmt(p.amountMinor, p.currency)}</td><td><span className="badge">{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  async function Reports() {
    const reports = await db.report.findMany({ include: { reporter: true, targetUser: true }, orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 200 });
    if (!reports.length) return <p className="muted">{t("admin.none")}</p>;
    return (
      <div className="stack">
        {reports.map((r) => (
          <div key={r.id} className="card">
            <div className="row between">
              <strong>{t(`report.reasons.${r.reason}`)}</strong>
              <span className={`badge ${r.status === "OPEN" ? "badge-warn" : ""}`}>{r.status}</span>
            </div>
            <div className="small muted">{r.reporter.email} → {r.targetUser?.email ?? "—"} · {r.createdAt.toLocaleString(loc)}</div>
            {r.details && <p className="small" style={{ margin: "6px 0" }}>{r.details}</p>}
            {r.status === "OPEN" && (
              <div className="row">
                <ActionButton path={`/admin/reports/${r.id}`} body={{ status: "RESOLVED" }} label={t("admin.resolve")} />
                <ActionButton path={`/admin/reports/${r.id}`} body={{ status: "DISMISSED" }} label={t("admin.dismiss")} />
                {r.targetUserId && <ActionButton path={`/admin/users/${r.targetUserId}`} body={{ status: "SUSPENDED" }} label={t("admin.suspend")} className="btn btn-danger btn-sm" />}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  async function CatalogAdmin() {
    const c = await getCatalog(locale, true);
    const toggle = (type: string, id: string, active: boolean) => (
      <ActionButton path="/admin/catalog" method="PATCH" body={{ type, id, active: !active }} label={active ? "✓" : "✕"} className={`btn btn-sm ${active ? "btn-outline" : "btn-danger"}`} />
    );
    return (
      <div className="stack">
        <div className="card">
          <h2>{t("admin.cities")}</h2>
          {c.cities.map((x) => <div key={x.id} className="row between small"><span>{x.name}, {x.country} <span className="muted">/{x.countrySlug}/{x.slug} · {x.timezone}</span></span>{toggle("city", x.id, x.active)}</div>)}
          <CatalogForm type="city" countries={c.countries} />
        </div>
        <div className="card">
          <h2>{t("admin.languages")}</h2>
          {c.languages.map((x) => <div key={x.id} className="row between small"><span>{x.flag} {x.name} <span className="muted">({x.code})</span></span>{toggle("language", x.id, x.active)}</div>)}
          <CatalogForm type="language" />
        </div>
        <div className="card">
          <h2>{t("admin.categories")}</h2>
          {c.categories.map((x) => <div key={x.id} className="row between small"><span>{x.icon} {x.name}</span>{toggle("category", x.id, x.active)}</div>)}
          <CatalogForm type="category" />
        </div>
      </div>
    );
  }
}
