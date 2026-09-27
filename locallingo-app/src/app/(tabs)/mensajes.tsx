import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { useApi } from "@/lib/useApi";
import { Avatar } from "@/components/Avatar";
import { LoginPrompt } from "@/components/LoginPrompt";
import { Badge, Card, ErrorText, Loading, P, Row, Screen } from "@/components/ui";

type Conv = { id: string; otherName: string; otherPhoto: string | null; lastMessage: string; lastMessageAt: string; unread: number };

export default function MessagesTab() {
  const { user } = useAuth();
  if (!user) return <LoginPrompt />;
  return <Conversations />;
}

function Conversations() {
  const { t, intl } = useI18n();
  const { data, error, loading, reload } = useApi<Conv[]>("/conversations");
  return (
    <Screen refreshing={loading} onRefresh={reload}>
      <ErrorText code={error} />
      {loading && !data && <Loading />}
      {data?.length === 0 && <P muted>{t("messages.empty")}</P>}
      {data?.map((c) => (
        <Pressable key={c.id} onPress={() => router.push(`/chat/${c.id}`)} accessibilityRole="button">
          <Card>
            <Row style={{ flexWrap: "nowrap" }}>
              <Avatar name={c.otherName} url={c.otherPhoto} size={46} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Row style={{ justifyContent: "space-between" }}>
                  <Text style={{ fontWeight: "700", fontSize: 16, color: colors.ink }}>{c.otherName}</Text>
                  <P small muted>{new Date(c.lastMessageAt).toLocaleString(intl, { dateStyle: "short", timeStyle: "short" })}</P>
                </Row>
                <Text numberOfLines={1} style={{ color: colors.muted }}>{c.lastMessage}</Text>
              </View>
              {c.unread > 0 && <Badge text={String(c.unread)} tone="ok" />}
            </Row>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}
