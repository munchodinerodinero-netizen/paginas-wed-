import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { intlLocale } from "@/i18n/core";
import { getI18n } from "@/i18n/server";
import { formatDateTime } from "@/lib/time";
import { getSessionUser } from "@/server/auth";
import { AppError } from "@/server/errors";
import { getMoney } from "@/server/format";
import { getBooking } from "@/server/services/bookings";
import { ActionButton } from "@/components/ActionButton";
import { ReviewForm } from "@/components/ReviewForm";
import { ReportForm } from "@/components/ReportForm";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata = { robots: { index: false } };

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/reservas/${id}`);
  const { t, locale } = await getI18n();
  const money = await getMoney();
  let data;
  try {
    data = await getBooking(user, id);
  } catch (e) {
    if (e instanceof AppError) notFound();
    throw e;
  }
  const { booking: b, isTourist, isGuide } = data;
  const tz = b.guide.city?.timezone;
  const fmt = (m: number) => money.fmt(m, b.currency);
  const reviewed = b.reviews.some((r) => r.direction === "TOURIST_TO_GUIDE");
  const started = b.startAt.getTime() <= Date.now();

  return (
    <div className="container" style={{ maxWidth: 720, padding: "24px 16px 64px" }}>
      <Link href="/panel" className="small">← {t("common.back")}</Link>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="row between">
          <h1 style={{ fontSize: "1.4rem", margin: 0 }}>{t("booking.detail", { code: b.code })}</h1>
          <StatusBadge status={b.status} t={t} />
        </div>
        <div className="stack" style={{ marginTop: 12 }}>
          <div><strong>{b.service.title}</strong></div>
          <div className="small">🗓️ {formatDateTime(b.startAt, intlLocale(locale), tz)} · ⏱️ {b.durationMin} min · 👥 {b.people}</div>
          <div className="small">{t("booking.guide")}: <Link href={`/guia/${b.guide.slug}`}>{b.guide.displayName}</Link> · {t("booking.tourist")}: {b.tourist.name.split(" ")[0]}</div>
          {b.meetingPoint && <div className="small">📌 {b.meetingPoint}</div>}
          {b.notes && <div className="small muted">📝 {b.notes}</div>}
        </div>
        <table className="breakdown" style={{ marginTop: 16 }}>
          <tbody>
            <tr><td>{t("booking.servicePrice")}</td><td>{fmt(b.subtotalMinor)}</td></tr>
            <tr className="muted small"><td>{t("booking.commission")} ({b.commissionBps / 100}%)</td><td>{fmt(b.commissionMinor)}</td></tr>
            {(isGuide || user.role === "ADMIN") && <tr className="small"><td>{t("booking.guideReceives")}</td><td>{fmt(b.guideNetMinor)}</td></tr>}
            {b.refundMinor > 0 && <tr className="small"><td>{t("booking.refund")}</td><td>−{fmt(b.refundMinor)}</td></tr>}
            <tr className="total"><td>{t("booking.total")}</td><td>{fmt(b.totalMinor)}</td></tr>
          </tbody>
        </table>

        <div className="row" style={{ marginTop: 16 }}>
          {isTourist && b.status === "PENDING_PAYMENT" && (
            <ActionButton path={`/bookings/${b.id}/pay`} label={t("booking.pay", { amount: fmt(b.totalMinor) })} className="btn btn-primary" />
          )}
          {isGuide && b.status === "PENDING" && (
            <>
              <ActionButton path={`/bookings/${b.id}/accept`} label={t("booking.accept")} className="btn btn-primary" />
              <ActionButton path={`/bookings/${b.id}/reject`} label={t("booking.reject")} className="btn btn-danger" />
            </>
          )}
          {isGuide && b.status === "ACCEPTED" && started && (
            <ActionButton path={`/bookings/${b.id}/complete`} label={t("booking.complete")} className="btn btn-primary" />
          )}
          {["PENDING_PAYMENT", "PENDING", "ACCEPTED"].includes(b.status) && (
            <ActionButton path={`/bookings/${b.id}/cancel`} label={t("booking.cancel")} confirm={t("booking.cancelConfirm")} className="btn btn-danger" />
          )}
        </div>
        {isTourist && b.status === "PENDING_PAYMENT" && <p className="small muted" style={{ marginTop: 8 }}>🔒 {t("booking.payNote")}</p>}
        {isTourist && b.status === "ACCEPTED" && <p className="small muted" style={{ marginTop: 8 }}>{t(`policies.${b.guide.cancellationPolicy}`)}</p>}
      </div>

      {isTourist && b.status === "COMPLETED" && (
        <div style={{ marginTop: 16 }}>{reviewed ? <p className="success">{t("booking.reviewed")}</p> : <ReviewForm bookingId={b.id} />}</div>
      )}
      <div style={{ marginTop: 16 }}>
        <ReportForm target={{ bookingId: b.id }} label={t("report.title")} />
      </div>
    </div>
  );
}
