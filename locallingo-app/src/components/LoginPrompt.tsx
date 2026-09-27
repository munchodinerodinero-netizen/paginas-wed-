import { router } from "expo-router";
import { useI18n } from "@/lib/i18n";
import { Button, Card, P, Screen } from "./ui";

export function LoginPrompt() {
  const { t } = useI18n();
  return (
    <Screen>
      <Card>
        <P>{t("app.loginRequired")}</P>
        <Button title={t("nav.login")} onPress={() => router.push("/login")} />
        <Button title={t("nav.register")} variant="outline" onPress={() => router.push("/registro")} />
      </Card>
    </Screen>
  );
}
