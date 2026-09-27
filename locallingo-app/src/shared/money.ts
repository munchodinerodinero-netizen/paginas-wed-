// Dinero en enteros (unidades menores). Nada de floats para montos.

// Decimales por moneda (JPY no tiene centavos).
const MINOR_DIGITS: Record<string, number> = { MXN: 2, USD: 2, EUR: 2, GBP: 2, CAD: 2, AUD: 2, JPY: 0 };

export function minorDigits(currency: string): number {
  return MINOR_DIGITS[currency] ?? 2;
}

/** "600.50" → 60050 (para MXN). Parsea strings sin pasar por float. */
export function toMinor(amount: string | number, currency: string): number {
  const digits = minorDigits(currency);
  const s = typeof amount === "number" ? amount.toFixed(digits) : amount.trim();
  if (!/^\d+(\.\d+)?$/.test(s)) throw new Error("Monto inválido");
  const [whole, frac = ""] = s.split(".");
  const fracPadded = (frac + "0".repeat(digits)).slice(0, digits);
  return Number(whole) * 10 ** digits + (digits ? Number(fracPadded) : 0);
}

/** Redondeo "half up" de una división entera no negativa. */
function divRound(numerator: bigint, denominator: bigint): bigint {
  return (numerator * 2n + denominator) / (denominator * 2n);
}

/** Aplica basis points (1500 = 15%) con redondeo half-up exacto. */
export function applyBps(amountMinor: number, bps: number): number {
  if (!Number.isInteger(amountMinor) || amountMinor < 0) throw new Error("Monto inválido");
  if (!Number.isInteger(bps) || bps < 0 || bps > 10000) throw new Error("Comisión inválida");
  return Number(divRound(BigInt(amountMinor) * BigInt(bps), 10000n));
}

export interface PriceBreakdown {
  subtotalMinor: number;
  discountMinor: number;
  touristFeeMinor: number;
  totalMinor: number;
  commissionBps: number;
  commissionMinor: number;
  guideNetMinor: number;
}

/**
 * Desglose de una reserva. La comisión se descuenta del precio del guía
 * (ej. $500 → guía $425, plataforma $75 con 15%). El descuento lo absorbe la plataforma
 * hasta el monto de su comisión, para no afectar lo que recibe el guía.
 */
export function priceBreakdown(opts: {
  subtotalMinor: number;
  commissionBps: number;
  discountMinor?: number;
  touristFeeMinor?: number;
}): PriceBreakdown {
  const { subtotalMinor, commissionBps } = opts;
  const discountMinor = Math.min(opts.discountMinor ?? 0, subtotalMinor);
  const touristFeeMinor = opts.touristFeeMinor ?? 0;
  const commissionMinor = applyBps(subtotalMinor, commissionBps);
  const guideNetMinor = subtotalMinor - commissionMinor;
  return {
    subtotalMinor,
    discountMinor,
    touristFeeMinor,
    totalMinor: subtotalMinor - discountMinor + touristFeeMinor,
    commissionBps,
    commissionMinor,
    guideNetMinor,
  };
}

/** Subtotal de un servicio: precio fijo o precio por hora × duración (minutos). */
export function serviceSubtotal(opts: { pricingType: string; priceMinor: number; durationMin: number }): number {
  if (opts.pricingType === "HOURLY") {
    return Number(divRound(BigInt(opts.priceMinor) * BigInt(opts.durationMin), 60n));
  }
  return opts.priceMinor;
}

/**
 * Conversión aproximada solo para MOSTRAR precios en otra moneda.
 * `rateMicros` = cuántas unidades menores de `to` equivale 1 unidad menor de `from`, × 1e6.
 * Los cobros siempre se hacen en la moneda original del servicio.
 */
export function convertMinor(amountMinor: number, rateMicros: number): number {
  return Number(divRound(BigInt(amountMinor) * BigInt(rateMicros), 1_000_000n));
}

export function formatMoney(amountMinor: number, currency: string, locale = "es-MX"): string {
  const digits = minorDigits(currency);
  const value = amountMinor / 10 ** digits; // solo presentación
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol", // "$600 MXN" en vez de "MX$600 MXN"
    minimumFractionDigits: amountMinor % 10 ** digits === 0 ? 0 : digits,
    maximumFractionDigits: digits,
  }).format(value);
}
