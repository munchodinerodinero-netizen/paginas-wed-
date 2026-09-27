import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, space } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

export function Screen({ children, refreshing, onRefresh, edges = ["bottom"] }: { children: ReactNode; refreshing?: boolean; onRefresh?: () => void; edges?: ("top" | "bottom")[] }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={edges}>
      <ScrollView
        contentContainerStyle={{ padding: space, paddingBottom: 48, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function H1({ children }: { children: ReactNode }) {
  return <Text style={s.h1}>{children}</Text>;
}
export function H2({ children }: { children: ReactNode }) {
  return <Text style={s.h2}>{children}</Text>;
}
export function P({ children, muted, small, style }: { children: ReactNode; muted?: boolean; small?: boolean; style?: object }) {
  return <Text style={[{ color: muted ? colors.muted : colors.ink, fontSize: small ? 13 : 15, lineHeight: small ? 18 : 21 }, style]}>{children}</Text>;
}

type BtnVariant = "primary" | "outline" | "danger" | "ghost";
export function Button({ title, onPress, variant = "primary", disabled, loading, small }: { title: string; onPress: () => void; variant?: BtnVariant; disabled?: boolean; loading?: boolean; small?: boolean }) {
  const v = btn[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [s.btn, small && s.btnSmall, v.box, (disabled || loading) && { opacity: 0.5 }, pressed && { opacity: 0.8 }]}
    >
      {loading ? <ActivityIndicator color={v.text.color} /> : <Text style={[s.btnText, small && { fontSize: 13 }, v.text]}>{title}</Text>}
    </Pressable>
  );
}
const btn: Record<BtnVariant, { box: ViewStyle; text: { color: string } }> = {
  primary: { box: { backgroundColor: colors.primary }, text: { color: "#fff" } },
  outline: { box: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }, text: { color: colors.ink } },
  danger: { box: { backgroundColor: "#fff", borderColor: "#f1c4c0", borderWidth: 1 }, text: { color: colors.danger } },
  ghost: { box: { backgroundColor: "transparent" }, text: { color: colors.primary } },
};

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} style={[s.input, props.multiline && { minHeight: 80, textAlignVertical: "top" }]} {...props} />
    </View>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <Text style={s.label}>{children}</Text>;
}

/** Selector de opciones como chips horizontales (sin dependencias nativas). */
export function Chips<T extends string | number>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T | null; onChange: (v: T) => void; label?: string }) {
  return (
    <View style={{ gap: 6 }}>
      {label && <Text style={s.label}>{label}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <Pressable key={String(o.value)} onPress={() => onChange(o.value)} style={[s.chip, on && s.chipOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
              <Text style={[s.chipText, on && { color: "#fff" }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function Badge({ text, tone = "neutral" }: { text: string; tone?: "neutral" | "ok" | "warn" | "bad" }) {
  const bg = { neutral: colors.background, ok: colors.okBg, warn: colors.warnBg, bad: colors.badBg }[tone];
  const fg = { neutral: colors.ink, ok: colors.success, warn: colors.warnInk, bad: colors.danger }[tone];
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      <Text style={{ color: fg, fontSize: 12, fontWeight: "700" }}>{text}</Text>
    </View>
  );
}

export function ErrorText({ code }: { code: string | null }) {
  const { t } = useI18n();
  if (!code) return null;
  const msg = code === "NETWORK_ERROR" ? t("app.serverError") : t(`errors.${code}`);
  return <Text style={{ color: colors.danger, fontSize: 14 }}>{msg.startsWith("errors.") ? t("common.error") : msg}</Text>;
}

export function Loading() {
  return <ActivityIndicator style={{ marginTop: 32 }} color={colors.primary} />;
}

export function Row({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }, style]}>{children}</View>;
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />;
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius, borderWidth: 1, borderColor: colors.border, padding: space, gap: 8 },
  h1: { fontSize: 26, fontWeight: "800", color: colors.ink, letterSpacing: -0.3 },
  h2: { fontSize: 19, fontWeight: "800", color: colors.ink },
  btn: { minHeight: 48, borderRadius: 12, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  btnSmall: { minHeight: 36, paddingHorizontal: 12 },
  btnText: { fontSize: 16, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "700", color: colors.ink },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colors.ink, backgroundColor: colors.surface },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: "600", color: colors.ink },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
});
