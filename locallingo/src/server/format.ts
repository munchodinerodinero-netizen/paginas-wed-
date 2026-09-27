import "server-only";
import { convertMinor, formatMoney } from "@/lib/money";
import { intlLocale } from "@/i18n/core";
import { getCurrency, getI18n } from "@/i18n/server";
import { getFxRates } from "./services/settings";

/**
 * Formateador de dinero para la petición actual: muestra el monto en su moneda original y,
 * si el usuario eligió otra moneda, una conversión aproximada.
 */
export async function getMoney() {
  const { locale, t } = await getI18n();
  const display = await getCurrency();
  const rates = await getFxRates();
  const loc = intlLocale(locale);
  const fmt = (minor: number, currency: string) => `${formatMoney(minor, currency, loc)} ${currency}`;
  const withApprox = (minor: number, currency: string) => {
    const rate = rates[`fx_${currency}_${display}`];
    if (currency === display || !rate) return fmt(minor, currency);
    return `${fmt(minor, currency)} (${t("common.approx")} ${fmt(convertMinor(minor, rate), display)})`;
  };
  return { fmt, withApprox, display };
}
