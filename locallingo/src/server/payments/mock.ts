import { randomUUID } from "node:crypto";
import type { PaymentProvider } from "./provider";

// Proveedor simulado para desarrollo y beta cerrada. Siempre aprueba.
export const mockProvider: PaymentProvider = {
  name: "mock",
  async createCharge() {
    return { providerRef: `mock_ch_${randomUUID()}`, status: "HELD" };
  },
  async capture() {},
  async refund() {
    return { providerRef: `mock_re_${randomUUID()}` };
  },
  async release() {},
  async payout() {
    return { providerRef: `mock_po_${randomUUID()}` };
  },
};
