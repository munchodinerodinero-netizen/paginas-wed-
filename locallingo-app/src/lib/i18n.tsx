import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import es from "@/shared/messages/es.json";
import en from "@/shared/messages/en.json";
import { getItem, setItem } from "./storage";
import { setApiLocale } from "./api";

// Mismos diccionarios que la web (sincronizados con `npm run sync-shared`).
const dictionaries = { es, en } as const;
export type Locale = keyof typeof dictionaries;
export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

function lookup(messages: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, p) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[p] : undefined), messages);
}

function createT(locale: Locale): TFunction {
  return (key, vars) => {
    let v = lookup(dictionaries[locale], key) ?? lookup(dictionaries.es, key);
    if (typeof v !== "string") return key;
    if (vars) for (const [k, val] of Object.entries(vars)) v = (v as string).replaceAll(`{${k}}`, String(val));
    return v as string;
  };
}

function deviceLocale(): Locale {
  const tag = Intl.DateTimeFormat().resolvedOptions().locale ?? "es";
  return tag.toLowerCase().startsWith("en") ? "en" : "es";
}

type Ctx = { locale: Locale; t: TFunction; setLocale: (l: Locale) => void; weekdays: string[]; intl: string };
const I18nContext = createContext<Ctx | null>(null);
const KEY = "ll_locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(deviceLocale());
  useEffect(() => {
    getItem(KEY).then((v) => v && (v === "es" || v === "en") && setLocaleState(v));
  }, []);
  setApiLocale(locale);
  const value = useMemo<Ctx>(
    () => ({
      locale,
      t: createT(locale),
      weekdays: [...dictionaries[locale].weekdays],
      intl: locale === "en" ? "en-US" : "es-MX",
      setLocale: (l) => {
        setLocaleState(l);
        setItem(KEY, l);
      },
    }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n fuera de I18nProvider");
  return ctx;
}
