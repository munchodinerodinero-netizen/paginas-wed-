import es from "./messages/es.json";
import en from "./messages/en.json";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "@/lib/constants";

// Agregar un idioma: crear messages/<code>.json con las mismas claves y registrarlo aquí
// y en SUPPORTED_LOCALES. Ningún texto de interfaz vive dentro de los componentes.
export const dictionaries = { es, en } as const;
export type Messages = typeof es;

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(v);
}

export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

function lookup(messages: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined), messages);
}

export function createT(locale: Locale): TFunction {
  const messages = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  return (key, vars) => {
    let value = lookup(messages, key) ?? lookup(dictionaries[DEFAULT_LOCALE], key);
    if (typeof value !== "string") return key;
    if (vars) for (const [k, v] of Object.entries(vars)) value = (value as string).replaceAll(`{${k}}`, String(v));
    return value as string;
  };
}

export function intlLocale(locale: Locale) {
  return locale === "en" ? "en-US" : "es-MX";
}

export function weekdayNames(locale: Locale): string[] {
  return [...(dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE]).weekdays];
}
