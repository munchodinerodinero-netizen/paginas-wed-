import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { useApi } from "@/lib/useApi";
import type { BookingRow } from "@/lib/types";
import { formatDateTime } from "@/shared/time";
import { Avatar } from "@/components/Avatar";
import { LoginPrompt } from "@/components/LoginPrompt";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, Chips, ErrorText, Loading, P, Row, Screen } from "@/components/ui";

const TOURIST_GROUPS: Record<string, (b: BookingRow) => boolean> = {
  upcoming: (b) => ["PENDING_PAYMENT", "PENDING", "ACCEPTED"].includes(b.status),
  completed: (b) => b.status === "COMPLETED",
  cancelled: (b) => ["CANCELLED", "REJECTED"].includes(b.status),
};
const GUIDE_GROUPS: Record<string, (b: BookingRow) => boolean> = {
  pending: (b) => b.status === "PENDING",
  accepted: (b) => b.status === "ACCEPTED",
  completed: (b) => b.status === "COMPLETED",
  cancelled: (b) => ["CANCELLED", "REJECTED"].includes(b.status),
};

export default function BookingsTab() {
  const { user } = useAuth();
  if (!user) return <LoginPrompt />;
  return <BookingsList isGuide={user.role === "GUIDE"} />;
}

function BookingsList({ isGuide }: { isGuide: boolean }) {
  const { t, intl } = useI18n();
  const { data, error, loading, reload } = useApi<BookingRow[]>("/bookings");
  const groups = isGuide ? GUIDE_GROUPS : TOURIST_GROUPS;
  const [filter, setFilter] = useState(Object.keys(groups)[0]);
  const rows = (data ?? []).filter(groups[filter]);

  return (
    <Screen refreshing={loading} onRefresh={reload}>
      <Chips value={filter} onChange={setFilter} options={Object.keys(groups).map((k) => ({ value: k, label: `${t(`dashboard.${k}`)} (${(data ?? []).filter(groups[k]).length})` }))} />
      <ErrorText code={error} />
      {loading && !data && <Loading />}
      {data && rows.length === 0 && <P muted>{t("dashboard.empty")}</P>}
      {rows.map((b) => (
        <Pressable key={b.id} onPress={() => router.push(`/reserva/${b.id}`)} accessibilityRole="button">
          <Card>
            <Row style={{ flexWrap: "nowrap" }}>
              <Avatar name={isGuide ? b.tourist.name : b.guide.displayName} url={isGuide ? null : b.guide.photoUrl} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", fontSize: 16, color: colors.ink }}>{b.service.title}</Text>
                <P small muted>{isGuide ? b.tourist.name.split(" ")[0] : b.guide.displayName} · {formatDateTime(new Date(b.startAt), intl, b.guide.city?.timezone)}</P>
              </View>
            </Row>
            <Row style={{ justifyContent: "space-between" }}>
              <StatusBadge status={b.status} />
              <Text style={{ fontWeight: "800", color: colors.ink }}>{money(isGuide ? b.guideNetMinor : b.totalMinor, b.currency, intl)}</Text>
            </Row>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}
