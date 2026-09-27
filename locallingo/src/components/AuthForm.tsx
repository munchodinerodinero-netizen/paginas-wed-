"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/client/api";
import { useI18n } from "@/i18n/client";
import { ErrorText } from "./ErrorText";

// Solo redirecciones internas (evita open redirects tipo ?next=//evil.com).
function safeNext(next: string | null, fallback: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const [role, setRole] = useState(params.get("role") === "GUIDE" ? "GUIDE" : "TOURIST");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="card"
      style={{ maxWidth: 440, margin: "32px auto" }}
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        setError(null);
        try {
          const body = Object.fromEntries(f.entries());
          const res = await apiFetch<{ user: { role: string } }>(mode === "login" ? "/auth/login" : "/auth/register", {
            body: mode === "register" ? { ...body, role } : body,
          });
          const fallback = res.user.role === "GUIDE" ? (mode === "register" ? "/ser-guia/registro" : "/panel") : res.user.role === "ADMIN" ? "/admin" : "/panel";
          router.push(safeNext(params.get("next"), fallback));
          router.refresh();
        } catch (err) {
          setError(err instanceof ApiError ? err.code : "INTERNAL_ERROR");
          setBusy(false);
        }
      }}
    >
      <h1 style={{ fontSize: "1.6rem" }}>{mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle")}</h1>
      {mode === "register" && (
        <>
          <div className="field">
            <label>{t("auth.iAm")}</label>
            <label className="checkbox"><input type="radio" name="_role" checked={role === "TOURIST"} onChange={() => setRole("TOURIST")} /> {t("auth.asTourist")}</label>
            <label className="checkbox"><input type="radio" name="_role" checked={role === "GUIDE"} onChange={() => setRole("GUIDE")} /> {t("auth.asGuide")}</label>
          </div>
          <div className="field">
            <label htmlFor="name">{t("auth.name")}</label>
            <input id="name" name="name" required minLength={2} maxLength={80} autoComplete="name" />
          </div>
        </>
      )}
      <div className="field">
        <label htmlFor="email">{t("auth.email")}</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="password">{t("auth.password")}</label>
        <input id="password" name="password" type="password" required minLength={mode === "register" ? 8 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} />
        {mode === "register" && <div className="small muted">{t("auth.passwordHint")}</div>}
      </div>
      <ErrorText code={error} />
      <button className="btn btn-primary btn-block" disabled={busy}>{mode === "login" ? t("auth.submitLogin") : t("auth.submitRegister")}</button>
      {mode === "register" && <p className="small muted" style={{ marginTop: 10 }}>{t("auth.acceptTerms")}</p>}
      <p className="small center" style={{ marginTop: 12 }}>
        {mode === "login" ? <>{t("auth.noAccount")} <Link href="/registro">{t("nav.register")}</Link></> : <>{t("auth.haveAccount")} <Link href="/login">{t("nav.login")}</Link></>}
      </p>
      {mode === "login" && process.env.NODE_ENV !== "production" && <p className="notice small">{t("auth.demo")}</p>}
    </form>
  );
}
