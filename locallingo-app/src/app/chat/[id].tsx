import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, errorCode } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { REPORT_REASONS } from "@/shared/constants";
import { Button, Chips, ErrorText, Loading, P } from "@/components/ui";

type Conv = {
  id: string;
  otherId: string;
  otherName: string;
  blocked: boolean;
  blockedByMe: boolean;
  messages: { id: string; mine: boolean; body: string; createdAt: string }[];
};

// Polling cada 5 s (igual que la web). Futuro: WebSockets + notificaciones push.
export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, intl } = useI18n();
  const [conv, setConv] = useState<Conv | null>(null);
  const [text, setText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<string>("OTHER");
  const list = useRef<FlatList>(null);
  const { ready } = useAuth();

  const load = useCallback(async () => {
    try {
      setConv(await api<Conv>(`/conversations/${id}`));
    } catch (e) {
      setError(errorCode(e));
    }
  }, [id]);

  useEffect(() => {
    if (!ready) return;
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [load, ready]);

  if (!conv) return error ? <ErrorText code={error} /> : <Loading />;

  const send = async () => {
    if (!text.trim()) return;
    setNotice(null);
    setError(null);
    try {
      const r = await api<{ redacted: boolean }>(`/conversations/${id}/messages`, { body: { body: text } });
      if (r.redacted) setNotice(t("messages.redacted"));
      setText("");
      load();
    } catch (e) {
      const code = errorCode(e);
      if (code === "CARD_NUMBER") setNotice(t("messages.cardBlocked"));
      else setError(code);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: conv.otherName,
          headerRight: () => (
            <Pressable
              hitSlop={10}
              onPress={async () => {
                await api("/blocks", { body: { userId: conv.otherId, blocked: !conv.blockedByMe } });
                load();
              }}
            >
              <Text style={{ color: colors.danger, fontWeight: "600" }}>{conv.blockedByMe ? t("messages.unblock") : "⛔"}</Text>
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={list}
          data={conv.messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}
          renderItem={({ item: m }) => (
            <View style={{ alignSelf: m.mine ? "flex-end" : "flex-start", maxWidth: "80%", backgroundColor: m.mine ? colors.primary : colors.surface, borderRadius: 14, padding: 10, borderWidth: m.mine ? 0 : 1, borderColor: colors.border }}>
              <Text style={{ color: m.mine ? "#fff" : colors.ink, fontSize: 15 }}>{m.body}</Text>
              <Text style={{ color: m.mine ? "#ffffffaa" : colors.muted, fontSize: 11, marginTop: 4 }}>
                {new Date(m.createdAt).toLocaleString(intl, { dateStyle: "short", timeStyle: "short" })}
              </Text>
            </View>
          )}
          ListEmptyComponent={<P muted style={{ textAlign: "center", marginTop: 24 }}>{t("messages.placeholder")}</P>}
        />
        <View style={{ paddingHorizontal: 12, gap: 6 }}>
          {notice && <P small style={{ backgroundColor: "#e7f3f4", padding: 8, borderRadius: 8 }}>{notice}</P>}
          <ErrorText code={error} />
          {reporting && (
            <View style={{ gap: 8, backgroundColor: colors.surface, padding: 10, borderRadius: 12 }}>
              <Chips label={t("report.reason")} value={reason} onChange={setReason} options={REPORT_REASONS.map((r) => ({ value: r, label: t(`report.reasons.${r}`) }))} />
              <Button
                small
                variant="danger"
                title={t("report.submit")}
                onPress={async () => {
                  await api("/reports", { body: { reason, conversationId: conv.id } });
                  setReporting(false);
                  setNotice(t("report.thanks"));
                }}
              />
            </View>
          )}
        </View>
        {conv.blocked ? (
          <P muted style={{ padding: 16 }}>{t("messages.blocked")}</P>
        ) : (
          <View style={{ flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
            <Pressable onPress={() => setReporting(!reporting)} hitSlop={8} style={{ justifyContent: "center" }} accessibilityLabel={t("messages.report")}>
              <Text style={{ fontSize: 18 }}>🚩</Text>
            </Pressable>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={t("messages.placeholder")}
              placeholderTextColor={colors.muted}
              maxLength={2000}
              onSubmitEditing={send}
              style={{ flex: 1, minHeight: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 22, paddingHorizontal: 14, fontSize: 16, color: colors.ink }}
            />
            <Button small title={t("messages.send")} onPress={send} />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
