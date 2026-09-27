import { Tabs } from "expo-router/js-tabs";
import { Text } from "react-native";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

const icon = (emoji: string) => ({ focused }: { focused: boolean }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>;

export default function TabsLayout() {
  const { t } = useI18n();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerTitleStyle: { fontWeight: "800", color: colors.ink },
        tabBarLabelStyle: { fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("app.tabExplore"), tabBarIcon: icon("🧭"), headerShown: false }} />
      <Tabs.Screen name="reservas" options={{ title: t("app.tabBookings"), tabBarIcon: icon("🗓️") }} />
      <Tabs.Screen name="mensajes" options={{ title: t("app.tabMessages"), tabBarIcon: icon("💬") }} />
      <Tabs.Screen name="perfil" options={{ title: t("app.tabProfile"), tabBarIcon: icon("👤") }} />
    </Tabs>
  );
}
