import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { api, errorCode } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { useApi } from "@/lib/useApi";
import type { PublicGuide, Quote } from "@/lib/types";
import { minutesToHHMM, weekdayOfDate } from "@/shared/time";
import { Button, Card, Chips, ErrorText, Field, Loading, P, Row, Screen } from "@/components/ui";

function nextDays(n: number) {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`);
  }
  return out;
}

export default function BookScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, intl, weekdays } = useI18n();
  const { user } = useAuth();
  const { data } = useApi<{ guide: PublicGuide }>(`/guides/${slug}`);
  const g = data?.guide;
  const [serviceId, setServiceId] = useState<string | null>(null);
  const service = g?.services.find((s) => s.id === serviceId) ?? g?.services[0];
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [hours, setHours] = useState(2);
  const [people, setPeople] = useState(1);
  const [meetingPoint, setMeetingPoint] = useState("");
  const [notes, setNotes] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const durationMin = service?.pricingType === "HOURLY" ? hours * 60 : service?.durationMin ?? 60;

  useEffect(() => {
    if (!service) return;
    api<Quote>("/bookings/quote", { body: { serviceId: service.id, durationMin } }).then(setQuote).catch(() => setQuote(null));
  }, [service?.id, durationMin]);

  const days = useMemo(() => nextDays(30).filter((d) => g?.availability.some((a) => a.weekday === weekdayOfDate(d))), [g]);
  const times = useMemo(() => {
    if (!date || !g) return [];
    const wd = weekdayOfDate(date);
    const out: string[] = [];
    for (const a of g.availability.filter((x) => x.weekday === wd)) for (let m = a.startMinute; m + durationMin <= a.endMinute; m += 30) out.push(minutesToHHMM(m));
    return out;
  }, [date, g, durationMin]);

  if (!g || !service) return <Loading />;
  const fmt = (m: number) => money(m, service.currency, intl);
  const dayLabel = (d: string) => {
    const [y, mo, da] = d.split("-").map(Number);
    return `${weekdays[weekdayOfDate(d)]} ${new Date(y, mo - 1, da).toLocaleDateString(intl, { day: "numeric", month: "short" })}`;
  };

  return (
    <Screen>
      <Card>
        <Chips label={t("booking.service")} value={service.id} onChange={(v) => { setServiceId(v); setTime(null); }} options={g.services.map((s) => ({ value: s.id, label: s.title }))} />
        {service.pricingType === "HOURLY" && (
          <Chips label={t("guide.duration")} value={hours} onChange={(h) => { setHours(h); setTime(null); }} options={[1, 2, 3, 4, 6, 8].map((h) => ({ value: h, label: `${h} h` }))} />
        )}
        <Chips label={t("booking.date")} value={date} onChange={(d) => { setDate(d); setTime(null); }} options={days.map((d) => ({ value: d, label: dayLabel(d) }))} />
        {date && (times.length ? <Chips label={t("booking.time")} value={time} onChange={setTime} options={times.map((x) => ({ value: x, label: x }))} /> : <P muted small>{t("app.noTimes")}</P>)}
        <Row>
          <P style={{ fontWeight: "700" }}>{t("booking.people")}</P>
          <Button small variant="outline" title="−" onPress={() => setPeople(Math.max(1, people - 1))} />
          <Text style={{ fontSize: 18, fontWeight: "700", minWidth: 24, textAlign: "center" }}>{people}</Text>
          <Button small variant="outline" title="+" onPress={() => setPeople(Math.min(service.maxPeople, people + 1))} />
        </Row>
        {service.modality === "IN_PERSON" && <Field label={t("booking.meetingPoint")} value={meetingPoint} onChangeText={setMeetingPoint} placeholder={service.meetingPoint ?? ""} maxLength={200} />}
        <Field label={t("booking.notes")} value={notes} onChangeText={setNotes} multiline maxLength={1000} />
      </Card>

      {quote && (
        <Card>
          <Row style={{ justifyContent: "space-between" }}><P>{t("booking.servicePrice")}</P><P>{fmt(quote.subtotalMinor)}</P></Row>
          <Row style={{ justifyContent: "space-between" }}><P small muted>{t("booking.commission")} ({quote.commissionBps / 100}%)</P><P small muted>{fmt(quote.commissionMinor)}</P></Row>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <Row style={{ justifyContent: "space-between" }}><P style={{ fontWeight: "800" }}>{t("booking.total")}</P><P style={{ fontWeight: "800" }}>{fmt(quote.totalMinor)}</P></Row>
        </Card>
      )}
      <ErrorText code={error} />
      <Button
        title={t("booking.confirm")}
        disabled={!date || !time || user?.role !== "TOURIST"}
        loading={busy}
        onPress={async () => {
          setBusy(true);
          setError(null);
          try {
            const b = await api<{ id: string }>("/bookings", {
              body: { serviceId: service.id, date, time, durationMin, people, meetingPoint: meetingPoint || undefined, notes: notes || undefined },
            });
            router.replace(`/reserva/${b.id}`);
          } catch (e) {
            setError(errorCode(e));
            setBusy(false);
          }
        }}
      />
    </Screen>
  );
}
