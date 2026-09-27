import { useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { api, errorCode } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { useApi } from "@/lib/useApi";
import type { BookingDetail } from "@/lib/types";
import { formatDateTime } from "@/shared/time";
import { StatusBadge } from "@/components/StatusBadge";
import { Button, Card, ErrorText, Field, H2, Loading, P, Row, Screen } from "@/components/ui";

/** Confirmación nativa (Alert) o window.confirm en web. */
function confirmAsync(message: string): Promise<boolean> {
  if (Platform.OS === "web") return Promise.resolve(globalThis.confirm?.(message) ?? true);
  return new Promise((resolve) =>
    Alert.alert("", message, [
      { text: "✕", style: "cancel", onPress: () => resolve(false) },
      { text: "OK", style: "destructive", onPress: () => resolve(true) },
    ]),
  );
}

const RATING_KEYS = ["rating", "communication", "punctuality", "knowledge", "experience"] as const;

function ReviewForm({ bookingId, onDone }: { bookingId: string; onDone: () => void }) {
  const { t } = useI18n();
  const [vals, setVals] = useState<Record<string, number>>({ rating: 5, communication: 5, punctuality: 5, knowledge: 5, experience: 5 });
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Card>
      <H2>{t("booking.leaveReview")}</H2>
      {RATING_KEYS.map((k) => (
        <Row key={k} style={{ justifyContent: "space-between" }}>
          <P small>{t(k === "rating" ? "ratings.overall" : `ratings.${k}`)}</P>
          <Row style={{ gap: 2 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setVals({ ...vals, [k]: n })} accessibilityRole="button" accessibilityLabel={`${n}`} hitSlop={6}>
                <Text style={{ fontSize: 26, color: n <= vals[k] ? "#f5a524" : "#d0d5dd" }}>★</Text>
              </Pressable>
            ))}
          </Row>
        </Row>
      ))}
      <Field label={t("booking.comment")} value={comment} onChangeText={setComment} multiline maxLength={2000} />
      <ErrorText code={error} />
      <Button
        title={t("booking.submitReview")}
        loading={busy}
        onPress={async () => {
          setBusy(true);
          try {
            await api(`/bookings/${bookingId}/review`, { body: { ...vals, comment } });
            onDone();
          } catch (e) {
            setError(errorCode(e));
          } finally {
            setBusy(false);
          }
        }}
      />
    </Card>
  );
}

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, intl } = useI18n();
  const { user } = useAuth();
  const { data: b, error, loading, reload } = useApi<BookingDetail>(`/bookings/${id}`);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading && !b) return <Loading />;
  if (!b) return <Screen><ErrorText code={error} /></Screen>;
  const isTourist = b.touristId === user?.id;
  const isGuide = b.guide.userId === user?.id;
  const fmt = (m: number) => money(m, b.currency, intl);
  const started = new Date(b.startAt).getTime() <= Date.now();
  const reviewed = b.reviews.some((r) => r.direction === "TOURIST_TO_GUIDE");

  const act = async (action: string, confirmMsg?: string) => {
    if (confirmMsg && !(await confirmAsync(confirmMsg))) return;
    setBusy(action);
    setActionError(null);
    try {
      await api(`/bookings/${b.id}/${action}`, { body: {} });
      await reload();
    } catch (e) {
      setActionError(errorCode(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen refreshing={loading} onRefresh={reload}>
      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <H2>{b.code}</H2>
          <StatusBadge status={b.status} />
        </Row>
        <Text style={{ fontSize: 17, fontWeight: "700", color: colors.ink }}>{b.service.title}</Text>
        <P small>🗓️ {formatDateTime(new Date(b.startAt), intl, b.guide.city?.timezone)} · ⏱️ {b.durationMin} min · 👥 {b.people}</P>
        <P small>{t("booking.guide")}: {b.guide.displayName} · {t("booking.tourist")}: {b.tourist.name.split(" ")[0]}</P>
        {!!b.meetingPoint && <P small>📌 {b.meetingPoint}</P>}
        {!!b.notes && <P small muted>📝 {b.notes}</P>}
      </Card>

      <Card>
        <Row style={{ justifyContent: "space-between" }}><P>{t("booking.servicePrice")}</P><P>{fmt(b.subtotalMinor)}</P></Row>
        <Row style={{ justifyContent: "space-between" }}><P small muted>{t("booking.commission")} ({b.commissionBps / 100}%)</P><P small muted>{fmt(b.commissionMinor)}</P></Row>
        {isGuide && <Row style={{ justifyContent: "space-between" }}><P small>{t("booking.guideReceives")}</P><P small>{fmt(b.guideNetMinor)}</P></Row>}
        {b.refundMinor > 0 && <Row style={{ justifyContent: "space-between" }}><P small>{t("booking.refund")}</P><P small>−{fmt(b.refundMinor)}</P></Row>}
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <Row style={{ justifyContent: "space-between" }}><P style={{ fontWeight: "800" }}>{t("booking.total")}</P><P style={{ fontWeight: "800" }}>{fmt(b.totalMinor)}</P></Row>
      </Card>

      {isTourist && b.status === "PENDING_PAYMENT" && (
        <>
          <P small muted>ℹ️ {t("app.bookingCreated")}</P>
          <Button title={t("booking.pay", { amount: fmt(b.totalMinor) })} loading={busy === "pay"} onPress={() => act("pay")} />
          <P small muted>🔒 {t("booking.payNote")}</P>
        </>
      )}
      {isTourist && b.status === "PENDING" && <P small muted>✅ {t("app.paid")}</P>}
      {isGuide && b.status === "PENDING" && (
        <Row>
          <View style={{ flex: 1 }}><Button title={t("booking.accept")} loading={busy === "accept"} onPress={() => act("accept")} /></View>
          <View style={{ flex: 1 }}><Button title={t("booking.reject")} variant="danger" loading={busy === "reject"} onPress={() => act("reject")} /></View>
        </Row>
      )}
      {isGuide && b.status === "ACCEPTED" && started && <Button title={t("booking.complete")} loading={busy === "complete"} onPress={() => act("complete")} />}
      {(isTourist || isGuide) && (
        <Button
          title={`💬 ${t("app.openChat")}`}
          variant="outline"
          onPress={async () => {
            try {
              const c = await api<{ id: string }>("/conversations", { body: { bookingId: b.id } });
              router.push(`/chat/${c.id}`);
            } catch (e) {
              setActionError(errorCode(e));
            }
          }}
        />
      )}
      {["PENDING_PAYMENT", "PENDING", "ACCEPTED"].includes(b.status) && (
        <Button title={t("booking.cancel")} variant="danger" loading={busy === "cancel"} onPress={() => act("cancel", t("booking.cancelConfirm"))} />
      )}
      {isTourist && b.status === "ACCEPTED" && <P small muted>{t(`policies.${b.guide.cancellationPolicy}`)}</P>}
      <ErrorText code={actionError} />

      {isTourist && b.status === "COMPLETED" && (reviewed ? <P>✅ {t("booking.reviewed")}</P> : <ReviewForm bookingId={b.id} onDone={reload} />)}
    </Screen>
  );
}
