// Abstracción de proveedor de pagos. La plataforma NUNCA toca datos de tarjeta:
// el proveedor (Stripe Connect, Mercado Pago, etc.) los procesa y nos devuelve una referencia.
//
// Modelo de fondos: el cobro se autoriza/retiene al pagar (HELD), se captura cuando el guía
// acepta (CAPTURED) y el neto del guía queda disponible para retiro cuando el servicio se
// completa. Rechazos/cancelaciones generan reembolsos según la política.

export interface ChargeResult {
  providerRef: string;
  status: "HELD" | "REQUIRES_ACTION" | "FAILED";
  redirectUrl?: string; // para checkouts alojados (3DS, OXXO, etc.)
}

export interface PaymentProvider {
  name: string;
  createCharge(input: { amountMinor: number; currency: string; bookingId: string; customerEmail: string }): Promise<ChargeResult>;
  capture(providerRef: string): Promise<void>;
  refund(providerRef: string, amountMinor: number): Promise<{ providerRef: string }>;
  release(providerRef: string): Promise<void>; // anular retención sin cobrar
  payout(input: { amountMinor: number; currency: string; guideId: string }): Promise<{ providerRef: string }>;
}
