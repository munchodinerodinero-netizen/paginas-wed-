import { useState } from "react";
import { Image, Text, View, ScrollView } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { api, API_URL, errorCode } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { useApi } from "@/lib/useApi";
import type { PublicGuide } from "@/lib/types";
import { minutesToHHMM } from "@/shared/time";
import { Avatar } from "@/components/Avatar";
import { Badge, Button, Card, Divider, ErrorText, H2, Loading, P, Row, Screen } from "@/components/ui";

type Resp = { guide: PublicGuide; reviews: { author: string; rating: number; comment: string; createdAt: string }[] };

export default function GuideProfile() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, intl, weekdays } = useI18n();
  const { user, ready } = useAuth();
  const { data, error, loading, reload } = useApi<Resp>(`/guides/${slug}`);
  const favs = useApi<{ id: string }[]>(user ? "/favorites" : null, [user?.id]);
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading && !data) return <Loading />;
  if (!data) return <Screen><ErrorText code={error} /></Screen>;
  const g = data.guide;
  const fav = !!favs.data?.some((f) => f.id === g.id);
  const needLogin = () => {
    if (user || !ready) return !user; // mientras carga la sesión, no redirigir
    router.push("/login");
    return true;
  };

  return (
    <Screen refreshing={loading} onRefresh={reload}>
      <Stack.Screen options={{ title: g.displayName }} />
      <Card>
        <Row style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
          <Avatar name={g.displayName} url={g.photoUrl} size={84} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 24, fontWeight: "800", color: colors.ink }}>{g.displayName}</Text>
            <P muted small>📍 {g.city}, {g.country}</P>
            <Row>
              {g.verified ? <Badge text={`✓ ${t("guide.verified")}`} tone="ok" /> : <Badge text={t("guide.pendingVerification")} tone="warn" />}
              {g.rating != null && <P small>⭐ {g.rating.toFixed(1)} ({g.reviewCount === 1 ? t("guide.reviewOne") : t("guide.reviews", { count: g.reviewCount })})</P>}
            </Row>
          </View>
        </Row>
        {!!g.headline && <P>“{g.headline}”</P>}
        {user?.role !== "GUIDE" && (
          <View style={{ gap: 8 }}>
          <Button title={t("guide.book")} onPress={() => !needLogin() && router.push(`/reservar/${g.slug}`)} />
          <Row style={{ flexWrap: "nowrap" }}>
            <View style={{ flex: 1 }}><Button
              title={`💬 ${t("guide.sendMessage")}`}
              variant="outline"
              onPress={async () => {
                if (needLogin()) return;
                try {
                  const c = await api<{ id: string }>("/conversations", { body: { guideId: g.id } });
                  router.push(`/chat/${c.id}`);
                } catch (e) {
                  setActionError(errorCode(e));
                }
              }}
            /></View>
            <Button
              title={fav ? "♥" : "♡"}
              variant="outline"
              onPress={async () => {
                if (needLogin()) return;
                await api("/favorites", { body: { guideId: g.id } });
                favs.reload();
              }}
            />
          </Row>
          </View>
        )}
        <ErrorText code={actionError} />
      </Card>

      <Card>
        <H2>{t("guide.languages")}</H2>
        {g.languages.map((l) => <P key={l.code}>{l.flag} {l.name} — <Text style={{ fontWeight: "700" }}>{t(`levels.${l.level}`)}</Text></P>)}
      </Card>

      {!!g.bio && (
        <Card>
          <H2>{t("guide.about")}</H2>
          <P>{g.bio}</P>
          {!!g.experience && (<><P style={{ fontWeight: "700" }}>{t("guide.experience")}</P><P>{g.experience}</P></>)}
        </Card>
      )}

      <Card>
        <H2>{t("guide.services")}</H2>
        {g.services.map((s, i) => (
          <View key={s.id} style={{ gap: 4 }}>
            {i > 0 && <Divider />}
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.ink }}>{s.title}</Text>
            <Text style={{ fontWeight: "800", color: colors.ink }}>
              {money(s.priceMinor, s.currency, intl)} <Text style={{ color: colors.muted, fontWeight: "500" }}>{s.pricingType === "HOURLY" ? t("guide.perHourLong") : t("guide.perService")}</Text>
            </Text>
            <P small muted>
              {s.category} · ⏱️ {s.durationMin % 60 === 0 ? t("guide.hours", { n: s.durationMin / 60 }) : t("guide.minutes", { n: s.durationMin })} · {t(`modality.${s.modality}`)} · 👥 {s.maxPeople}
            </P>
            <P small>🗣️ {s.languages.join(" / ")}</P>
            {!!s.description && <P small>{s.description}</P>}
            {!!s.meetingPoint && <P small muted>📌 {s.meetingPoint}</P>}
          </View>
        ))}
      </Card>

      {g.photos.length > 0 && (
        <Card>
          <H2>{t("guide.photos")}</H2>
          <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
            {g.photos.map((p) => <Image key={p} source={{ uri: p.startsWith("/") ? `${API_URL}${p}` : p }} style={{ width: 140, height: 140, borderRadius: 10 }} />)}
          </ScrollView>
        </Card>
      )}

      <Card>
        <H2>{t("guide.availability")}</H2>
        {[1, 2, 3, 4, 5, 6, 0].map((d) => {
          const slots = g.availability.filter((a) => a.weekday === d);
          return (
            <Row key={d} style={{ justifyContent: "space-between" }}>
              <P style={{ fontWeight: "700" }}>{weekdays[d]}</P>
              <P muted={!slots.length}>{slots.length ? slots.map((s) => `${minutesToHHMM(s.startMinute)}–${minutesToHHMM(s.endMinute)}`).join(", ") : "—"}</P>
            </Row>
          );
        })}
      </Card>

      <Card>
        <H2>{t("guide.ratings")}</H2>
        {data.reviews.length === 0 && <P muted>{t("guide.noReviews")}</P>}
        {data.reviews.map((r, i) => (
          <View key={i} style={{ gap: 2 }}>
            {i > 0 && <Divider />}
            <Row style={{ justifyContent: "space-between" }}>
              <P style={{ fontWeight: "700" }}>{r.author}</P>
              <P small>{"⭐".repeat(r.rating)} <Text style={{ color: colors.muted }}>{new Date(r.createdAt).toLocaleDateString(intl)}</Text></P>
            </Row>
            {!!r.comment && <P small>{r.comment}</P>}
          </View>
        ))}
      </Card>

      <Card>
        <H2>{t("guide.cancellationPolicy")}</H2>
        <P small>{t(`policies.${g.cancellationPolicy}`)}</P>
      </Card>
      {user?.role !== "GUIDE" && <Button title={t("app.reserveCta")} onPress={() => !needLogin() && router.push(`/reservar/${g.slug}`)} />}
    </Screen>
  );
}
