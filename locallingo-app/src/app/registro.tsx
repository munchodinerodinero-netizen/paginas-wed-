import { useState } from "react";
import { router } from "expo-router";
import { errorCode } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button, Card, Chips, ErrorText, Field, P, Screen } from "@/components/ui";

export default function Register() {
  const { t } = useI18n();
  const { register } = useAuth();
  const [role, setRole] = useState<"TOURIST" | "GUIDE">("TOURIST");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Screen>
      <Card>
        <Chips label={t("auth.iAm")} value={role} onChange={setRole} options={[{ value: "TOURIST" as const, label: t("auth.asTourist") }, { value: "GUIDE" as const, label: t("auth.asGuide") }]} />
        <Field label={t("auth.name")} value={name} onChangeText={setName} autoComplete="name" maxLength={80} />
        <Field label={t("auth.email")} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <Field label={t("auth.password")} value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" placeholder={t("auth.passwordHint")} />
        <ErrorText code={error} />
        <Button
          title={t("auth.submitRegister")}
          loading={busy}
          disabled={name.length < 2 || !email || password.length < 8}
          onPress={async () => {
            setBusy(true);
            setError(null);
            try {
              await register({ name: name.trim(), email: email.trim(), password, role });
              router.replace(role === "GUIDE" ? "/ser-guia" : "/");
            } catch (e) {
              setError(errorCode(e));
              setBusy(false);
            }
          }}
        />
        <P small muted>{t("auth.acceptTerms")}</P>
        <Button title={`${t("auth.haveAccount")} ${t("nav.login")}`} variant="ghost" onPress={() => router.replace("/login")} />
      </Card>
    </Screen>
  );
}
