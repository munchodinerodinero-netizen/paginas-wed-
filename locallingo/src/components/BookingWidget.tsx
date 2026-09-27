"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiFetch, ApiError } from "@/lib/client/api";
import { formatMoney } from "@/lib/money";
import { minutesToHHMM, weekdayOfDate } from "@/lib/time";
import { useI18n } from "@/i18n/client";
import { intlLocale } from "@/i18n/core";
import type { PublicGuide } from "@/server/services/guides";
import { ErrorText } from "./ErrorText";

type Quote = { subtotalMinor: number; commissionMinor: number; guideNetMinor: number; totalMinor: number; commissionBps: number; durationMin: number };

export function BookingWidget({ guide, loggedIn, isTourist }: { guide: PublicGuide; loggedIn: boolean; isTourist: boolean }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [serviceId, setServiceId] = useState(guide.services[0]?.id ?? "");
  const service = guide.services.find((s) => s.id === serviceId);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationMin, setDurationMin] = useState(service?.durationMin ?? 60);
  const [people, setPeople] = useState(1);
  const [meetingPoint, setMeetingPoint] = useState("");
  const [notes, setNotes] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const effectiveDuration = service?.pricingType === "HOURLY" ? durationMin : service?.durationMin ?? 60;

  useEffect(() => {
    if (service) setDurationMin(service.pricingType === "HOURLY" ? Math.max(60, service.durationMin) : service.durationMin);
  }, [serviceId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!serviceId) return;
    apiFetch<Quote>("/bookings/quote", { body: { serviceId, durationMin: effectiveDuration } }).then(setQuote).catch(() => setQuote(null));
  }, [serviceId, effectiveDuration]);

  // Horarios posibles para la fecha elegida según la disponibilidad semanal del guía.
  const times = useMemo(() => {
    if (!date) return [];
    const wd = weekdayOfDate(date);
    const out: string[] = [];
    for (const a of guide.availability.filter((x) => x.weekday === wd)) {
      for (let m = a.startMinute; m + effectiveDuration <= a.endMinute; m += 30) out.push(minutesToHHMM(m));
    }
    return out;
  }, [date, effectiveDuration, guide.availability]);

  const today = new Date().toISOString().slice(0, 10);
  const fmt = (minor: number) => `${formatMoney(minor, service?.currency ?? "MXN", intlLocale(locale))} ${service?.currency ?? "MXN"}`;

  if (!guide.services.length) return null;

  return (
    <div className="card sticky" id="reservar">
      <h3>{t("booking.title")}</h3>
      <div className="field">
        <label htmlFor="svc">{t("booking.service")}</label>
        <select id="svc" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
          {guide.services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </div>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="date">{t("booking.date")}</label>
          <input id="date" type="date" min={today} value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="time">{t("booking.time")}</label>
          <select id="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={!times.length}>
            <option value="">—</option>
            {times.map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
      </div>
      {date && !times.length && <p className="small error">{t("errors.SLOT_UNAVAILABLE")}</p>}
      <div className="row" style={{ flexWrap: "nowrap" }}>
        {service?.pricingType === "HOURLY" && (
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="dur">{t("booking.duration")}</label>
            <select id="dur" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))}>
              {[60, 90, 120, 180, 240, 360, 480].map((m) => <option key={m} value={m}>{m / 60} h</option>)}
            </select>
          </div>
        )}
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="people">{t("booking.people")}</label>
          <input id="people" type="number" min={1} max={service?.maxPeople ?? 10} value={people} onChange={(e) => setPeople(Number(e.target.value))} />
        </div>
      </div>
      {service?.modality === "IN_PERSON" && (
        <div className="field">
          <label htmlFor="mp">{t("booking.meetingPoint")}</label>
          <input id="mp" value={meetingPoint} placeholder={service.meetingPoint ?? ""} onChange={(e) => setMeetingPoint(e.target.value)} maxLength={200} />
        </div>
      )}
      <div className="field">
        <label htmlFor="notes">{t("booking.notes")}</label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} style={{ minHeight: 64 }} />
      </div>

      {quote && (
        <table className="breakdown">
          <tbody>
            <tr><td>{t("booking.servicePrice")}</td><td>{fmt(quote.subtotalMinor)}</td></tr>
            <tr className="muted small"><td>{t("booking.commission")} ({quote.commissionBps / 100}%)</td><td>{fmt(quote.commissionMinor)}</td></tr>
            <tr className="total"><td>{t("booking.total")}</td><td>{fmt(quote.totalMinor)}</td></tr>
          </tbody>
        </table>
      )}

      <ErrorText code={error} />
      {!loggedIn ? (
        <a className="btn btn-primary btn-block" href={`/login?next=/guia/${guide.slug}`} style={{ marginTop: 12 }}>{t("booking.loginToBook")}</a>
      ) : (
        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 12 }}
          disabled={!isTourist || !date || !time || busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              const b = await apiFetch<{ id: string }>("/bookings", {
                body: { serviceId, date, time, durationMin: effectiveDuration, people, meetingPoint: meetingPoint || undefined, notes: notes || undefined },
              });
              router.push(`/reservas/${b.id}`);
            } catch (e) {
              setError(e instanceof ApiError ? e.code : "INTERNAL_ERROR");
              setBusy(false);
            }
          }}
        >
          {t("booking.confirm")}
        </button>
      )}
    </div>
  );
}
