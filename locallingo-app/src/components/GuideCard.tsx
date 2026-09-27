import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useI18n } from "@/lib/i18n";
import { money } from "@/lib/format";
import { colors } from "@/lib/theme";
import type { GuideCard as Card } from "@/lib/types";
import { Avatar } from "./Avatar";
import { Badge, Card as Box, P, Row } from "./ui";

export function GuideCard({ g }: { g: Card }) {
  const { t, intl, weekdays } = useI18n();
  return (
    <Pressable onPress={() => router.push(`/guia/${g.slug}`)} accessibilityRole="button" accessibilityLabel={g.displayName}>
      {({ pressed }) => (
        <Box style={{ opacity: pressed ? 0.85 : 1 }}>
          <Row style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
            <Avatar name={g.displayName} url={g.photoUrl} size={60} />
            <View style={{ flex: 1, gap: 2 }}>
              <Row>
                <Text style={{ fontSize: 18, fontWeight: "800", color: colors.ink }}>{g.displayName}</Text>
                {g.verified && <Badge text={`✓ ${t("guide.verified")}`} tone="ok" />}
              </Row>
              <P muted small>📍 {g.city}, {g.country}</P>
              <P small>
                {g.rating != null ? `⭐ ${g.rating.toFixed(1)} (${g.reviewCount === 1 ? t("guide.reviewOne") : t("guide.reviews", { count: g.reviewCount })})` : t("guide.noReviews")}
              </P>
            </View>
          </Row>
          <View>
            {g.languages.map((l) => <P key={l.code} small>{l.flag} {l.name} {t(`levels.${l.level}`)}</P>)}
          </View>
          {!!g.headline && <P small muted>“{g.headline}”</P>}
          {g.availableWeekdays.length > 0 && <P small muted>🗓️ {t("guide.availableOn", { days: g.availableWeekdays.map((d) => weekdays[d]).join(", ") })}</P>}
          <Row style={{ justifyContent: "space-between" }}>
            {g.fromPriceMinor != null && (
              <Text style={{ fontWeight: "800", fontSize: 16, color: colors.ink }}>
                {t("guide.from")} {money(g.fromPriceMinor, g.currency, intl)}{g.fromIsHourly ? t("guide.perHour") : ""}
              </Text>
            )}
            <Text style={{ color: colors.primary, fontWeight: "700" }}>{t("guide.viewProfile")} →</Text>
          </Row>
        </Box>
      )}
    </Pressable>
  );
}
