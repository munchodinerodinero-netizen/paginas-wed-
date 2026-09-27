import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

function RootStack() {
  const { t } = useI18n();
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.ink, fontWeight: "700" },
        contentStyle: { backgroundColor: colors.background },
        headerBackTitle: t("common.back"),
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="guia/[slug]" options={{ title: "" }} />
      <Stack.Screen name="reservar/[slug]" options={{ title: t("booking.title") }} />
      <Stack.Screen name="reserva/[id]" options={{ title: t("app.tabBookings") }} />
      <Stack.Screen name="chat/[id]" options={{ title: t("messages.title") }} />
      <Stack.Screen name="ser-guia" options={{ title: t("onboarding.title") }} />
      <Stack.Screen name="login" options={{ title: t("auth.loginTitle"), presentation: "modal" }} />
      <Stack.Screen name="registro" options={{ title: t("auth.registerTitle"), presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <RootStack />
        </AuthProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
