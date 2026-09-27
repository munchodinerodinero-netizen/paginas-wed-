import { useState } from "react";
import { router } from "expo-router";
import { errorCode } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button, Card, ErrorText, Field, P, Screen } from "@/components/ui";

export default function Login() {
  const { t } = useI18n();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Screen>
      <Card>
        <Field label={t("auth.email")} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
        <Field label={t("auth.password")} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" />
        <ErrorText code={error} />
        <Button
          title={t("auth.submitLogin")}
          loading={busy}
          disabled={!email || !password}
          onPress={async () => {
            setBusy(true);
            setError(null);
            try {
              await login(email.trim(), password);
              router.back();
            } catch (e) {
              setError(errorCode(e));
              setBusy(false);
            }
          }}
        />
        <Button title={`${t("auth.noAccount")} ${t("nav.register")}`} variant="ghost" onPress={() => router.replace("/registro")} />
        {__DEV__ && <P small muted>{t("auth.demo")}</P>}
      </Card>
    </Screen>
  );
}
