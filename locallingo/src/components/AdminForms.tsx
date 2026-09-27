"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/client/api";
import { useI18n } from "@/i18n/client";
import { ErrorText } from "./ErrorText";

export function CommissionForm({ bps }: { bps: number }) {
  const { t } = useI18n();
  const [pct, setPct] = useState(String(bps / 100));
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="card"
      style={{ maxWidth: 420 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setMsg(null);
        setError(null);
        // "15.5" → 1550 bps sin floats: se parsea como texto.
        const m = pct.trim().match(/^(\d{1,2})(?:\.(\d{1,2}))?$/);
        if (!m) return setError("VALIDATION_ERROR");
        const commissionBps = Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0"));
        try {
          await apiFetch("/admin/settings", { method: "PUT", body: { commissionBps } });
          setMsg(t("admin.saved"));
        } catch (err) {
          setError(err instanceof ApiError ? err.code : "INTERNAL_ERROR");
        }
      }}
    >
      <div className="field">
        <label htmlFor="pct">{t("admin.commissionLabel")}</label>
        <input id="pct" inputMode="decimal" value={pct} onChange={(e) => setPct(e.target.value)} />
      </div>
      <ErrorText code={error} />
      {msg && <p className="success">{msg}</p>}
      <button className="btn btn-primary">{t("admin.save")}</button>
    </form>
  );
}

export function CatalogForm({ type, countries }: { type: "city" | "language" | "category"; countries?: { id: string; name: string }[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="row"
      style={{ alignItems: "flex-end", marginTop: 8 }}
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const g = (k: string) => String(f.get(k) ?? "").trim();
        const body: Record<string, unknown> = { type, names: { es: g("es"), en: g("en") } };
        if (type === "city") Object.assign(body, { countryId: g("countryId"), timezone: g("timezone") || undefined });
        if (type === "language") Object.assign(body, { code: g("code"), flag: g("flag") });
        if (type === "category") Object.assign(body, { icon: g("icon") });
        try {
          await apiFetch("/admin/catalog", { body });
          (e.target as HTMLFormElement).reset();
          router.refresh();
        } catch (err) {
          setError(err instanceof ApiError ? err.code : "INTERNAL_ERROR");
        }
      }}
    >
      <div style={{ flex: 1, minWidth: 120 }}><label>ES</label><input name="es" required /></div>
      <div style={{ flex: 1, minWidth: 120 }}><label>EN</label><input name="en" required /></div>
      {type === "city" && (
        <>
          <div style={{ minWidth: 120 }}>
            <label>{t("onboarding.country")}</label>
            <select name="countryId">{countries?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </div>
          <div style={{ minWidth: 160 }}><label>TZ</label><input name="timezone" placeholder="America/Mexico_City" /></div>
        </>
      )}
      {type === "language" && (
        <>
          <div style={{ width: 80 }}><label>ISO</label><input name="code" required maxLength={5} /></div>
          <div style={{ width: 80 }}><label>Flag</label><input name="flag" maxLength={8} /></div>
        </>
      )}
      {type === "category" && <div style={{ width: 80 }}><label>Icon</label><input name="icon" maxLength={8} /></div>}
      <button className="btn btn-outline">{t("admin.add")}</button>
      <ErrorText code={error} />
    </form>
  );
}
