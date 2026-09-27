import "server-only";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, ACTIVE_CURRENCIES, type Currency, type Locale } from "@/lib/constants";
import { createT, isLocale, dictionaries } from "./core";

export const LOCALE_COOKIE = "ll_locale";
export const CURRENCY_COOKIE = "ll_currency";

export async function getLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  const accept = (await headers()).get("accept-language") ?? "";
  const preferred = accept.split(",")[0]?.slice(0, 2).toLowerCase();
  return isLocale(preferred) ? preferred : DEFAULT_LOCALE;
}

export async function getCurrency(): Promise<Currency> {
  const c = (await cookies()).get(CURRENCY_COOKIE)?.value;
  return (ACTIVE_CURRENCIES as readonly string[]).includes(c ?? "") ? (c as Currency) : "MXN";
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: createT(locale), messages: dictionaries[locale] };
}
