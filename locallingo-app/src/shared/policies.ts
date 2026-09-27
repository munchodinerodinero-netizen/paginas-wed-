import type { CancellationPolicy } from "./constants";

/** Porcentaje (0–100) de reembolso al turista cuando ÉL cancela una reserva aceptada. */
export function touristRefundPercent(policy: CancellationPolicy | string, hoursBefore: number): number {
  switch (policy) {
    case "FLEXIBLE":
      return hoursBefore >= 24 ? 100 : 0;
    case "STRICT":
      return hoursBefore >= 24 * 7 ? 50 : 0;
    case "MODERATE":
    default:
      return hoursBefore >= 48 ? 100 : hoursBefore >= 24 ? 50 : 0;
  }
}
