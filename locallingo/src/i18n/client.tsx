"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createT, type TFunction } from "./core";
import type { Locale } from "@/lib/constants";

const I18nContext = createContext<{ locale: Locale; t: TFunction; currency: string } | null>(null);

export function I18nProvider({ locale, currency, children }: { locale: Locale; currency: string; children: ReactNode }) {
  const value = useMemo(() => ({ locale, currency, t: createT(locale) }), [locale, currency]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n fuera de I18nProvider");
  return ctx;
}
