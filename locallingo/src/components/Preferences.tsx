"use client";
import { useRouter } from "next/navigation";
import { ACTIVE_CURRENCIES, SUPPORTED_LOCALES } from "@/lib/constants";
import { apiFetch } from "@/lib/client/api";
import { useI18n } from "@/i18n/client";

const LOCALE_LABEL: Record<string, string> = { es: "ES", en: "EN" };

export function Preferences() {
  const { locale, currency, t } = useI18n();
  const router = useRouter();
  const set = async (body: object) => {
    await apiFetch("/preferences", { body });
    router.refresh();
  };
  return (
    <div className="row" style={{ gap: 6, flexWrap: "nowrap" }}>
      <select aria-label={t("nav.language")} value={locale} onChange={(e) => set({ locale: e.target.value })} style={{ width: "auto", minHeight: 36, padding: "4px 8px" }}>
        {SUPPORTED_LOCALES.map((l) => <option key={l} value={l}>🌐 {LOCALE_LABEL[l]}</option>)}
      </select>
      <select aria-label={t("nav.currency")} value={currency} onChange={(e) => set({ currency: e.target.value })} style={{ width: "auto", minHeight: 36, padding: "4px 8px" }}>
        {ACTIVE_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );
}
