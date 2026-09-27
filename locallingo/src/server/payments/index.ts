import "server-only";
import type { PaymentProvider } from "./provider";
import { mockProvider } from "./mock";

// Para integrar Stripe Connect / Mercado Pago: implementar PaymentProvider en un archivo
// nuevo y registrarlo aquí. El resto del sistema no cambia.
const providers: Record<string, PaymentProvider> = { mock: mockProvider };

export function paymentProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER ?? "mock";
  const p = providers[name];
  if (!p) throw new Error(`Proveedor de pagos desconocido: ${name}`);
  return p;
}
