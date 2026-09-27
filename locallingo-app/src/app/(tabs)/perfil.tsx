import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { api, API_URL, errorCode } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/format";
import { useI18n, type Locale } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { useApi } from "@/lib/useApi";
import { Avatar } from "@/components/Avatar";
import { LoginPrompt } from "@/components/LoginPrompt";
import { Badge, Button, Card, Chips, ErrorText, H2, P, Row, Screen } from "@/components/ui";

type Earnings = { currency: string; gross: number; commission: number; net: number; available: number; upcoming: number; payouts: { id: string; amountMinor: number; currency: string; status: string; createdAt: string }[] };
type OwnProfile = { status: string; slug: string; ratingSum: number; ratingCount: number; rejectionReason: string | null };

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useI18n();
  if (!user) return <LoginPrompt />;
  return (
    <Screen>
      <Card>
        <Row style={{ flexWrap: "nowrap" }}>
          <Avatar name={user.name} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.ink }}>{user.name}</Text>
            <P small muted>{user.email}</P>
            <Badge text={user.role === "GUIDE" ? t("app.guideMode") : t("app.touristMode")} />
          </View>
        </Row>
        <Chips label={t("nav.language")} value={locale} onChange={(l: Locale) => setLocale(l)} options={[{ value: "es" as Locale, label: "Español" }, { value: "en" as Locale, label: "English" }]} />
      </Card>
      {user.role === "GUIDE" ? <GuideSection /> : <Favorites />}
      {user.role === "ADMIN" && <Button title={t("nav.admin")} variant="outline" onPress={() => Linking.openURL(`${API_URL}/admin`)} />}
      <Row style={{ justifyContent: "center", gap: 16 }}>
        {(["privacidad", "terminos", "cancelacion"] as const).map((d, i) => (
          <Pressable key={d} onPress={() => Linking.openURL(`${API_URL}/legal/${d}`)}>
            <Text style={{ color: colors.muted }}>{t(["footer.privacy", "footer.terms", "footer.cancellation"][i])}</Text>
          </Pressable>
        ))}
      </Row>
      <Button title={t("nav.logout")} variant="danger" onPress={logout} />
    </Screen>
  );
}

function Favorites() {
  const { t } = useI18n();
  const { data } = useApi<{ id: string; slug: string; displayName: string; photoUrl: string | null }[]>("/favorites");
  return (
    <Card>
      <H2>{t("dashboard.favorites")}</H2>
      {data?.length === 0 && <P muted>{t("dashboard.noFavorites")}</P>}
      {data?.map((g) => (
        <Pressable key={g.id} onPress={() => router.push(`/guia/${g.slug}`)}>
          <Row><Avatar name={g.displayName} url={g.photoUrl} size={36} /><P style={{ fontWeight: "700" }}>{g.displayName}</P></Row>
        </Pressable>
      ))}
    </Card>
  );
}

function GuideSection() {
  const { t, intl } = useI18n();
  const profile = useApi<OwnProfile>("/guide/profile");
  const earnings = useApi<Earnings>("/guide/earnings");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const p = profile.data;
  const e = earnings.data;
  const fmt = (m: number) => money(m, e?.currency ?? "MXN", intl);

  return (
    <>
      {p && (
        <Card>
          <Row style={{ justifyContent: "space-between" }}>
            <H2>{t("dashboard.profileStatus")}</H2>
            <Badge
              text={p.status === "APPROVED" ? t("guide.verified") : p.status === "PENDING" ? t("guide.pendingVerification") : p.status}
              tone={p.status === "APPROVED" ? "ok" : p.status === "REJECTED" ? "bad" : "warn"}
            />
          </Row>
          {p.ratingCount > 0 && <P>⭐ {(p.ratingSum / p.ratingCount).toFixed(1)} · {t("guide.reviews", { count: p.ratingCount })}</P>}
          {!!p.rejectionReason && <P small>{p.rejectionReason}</P>}
          {p.status === "DRAFT" && <P small muted>{t("app.completeProfileWeb")}</P>}
          {/* El registro de 6 pasos (con subida de documentos) vive en la web en esta versión. */}
          <Button title={p.status === "DRAFT" ? t("onboarding.title") : t("dashboard.editProfile")} variant="outline" onPress={() => Linking.openURL(`${API_URL}/ser-guia/registro`)} />
          {p.status === "APPROVED" && <Button title={t("guide.viewProfile")} variant="ghost" onPress={() => router.push(`/guia/${p.slug}`)} />}
        </Card>
      )}
      {e && (
        <Card>
          <H2>{t("dashboard.earnings")}</H2>
          {[["gross", e.gross], ["commission", -e.commission], ["net", e.net], ["available", e.available]].map(([k, v]) => (
            <Row key={k as string} style={{ justifyContent: "space-between" }}>
              <P muted={k !== "available"}>{t(`dashboard.${k}`)}</P>
              <P style={{ fontWeight: k === "available" ? "800" : "500" }}>{(v as number) < 0 ? `−${fmt(-(v as number))}` : fmt(v as number)}</P>
            </Row>
          ))}
          <ErrorText code={error} />
          {e.available > 0 && (
            <Button
              title={t("dashboard.requestPayout")}
              loading={busy}
              onPress={async () => {
                setBusy(true);
                try {
                  await api("/guide/payouts", { body: {} });
                  await earnings.reload();
                } catch (err) {
                  setError(errorCode(err));
                } finally {
                  setBusy(false);
                }
              }}
            />
          )}
          {e.payouts.map((po) => (
            <Row key={po.id} style={{ justifyContent: "space-between" }}>
              <P small muted>{new Date(po.createdAt).toLocaleDateString(intl)}</P>
              <P small>{money(po.amountMinor, po.currency, intl)}</P>
              <Badge text={po.status} />
            </Row>
          ))}
        </Card>
      )}
    </>
  );
}

