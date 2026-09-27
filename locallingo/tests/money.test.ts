import { test } from "node:test";
import assert from "node:assert/strict";
import { applyBps, convertMinor, priceBreakdown, serviceSubtotal, toMinor } from "../src/lib/money";

test("ejemplo del negocio: $500 MXN con 15% → guía $425, plataforma $75", () => {
  const b = priceBreakdown({ subtotalMinor: toMinor("500", "MXN"), commissionBps: 1500 });
  assert.equal(b.totalMinor, 50000);
  assert.equal(b.commissionMinor, 7500);
  assert.equal(b.guideNetMinor, 42500);
});

test("comisión + neto siempre suman el subtotal (sin centavos perdidos)", () => {
  for (const amount of [1, 7, 333, 99999, 123457]) {
    for (const bps of [0, 1, 1250, 1500, 3333, 10000]) {
      const b = priceBreakdown({ subtotalMinor: amount, commissionBps: bps });
      assert.equal(b.commissionMinor + b.guideNetMinor, amount);
    }
  }
});

test("redondeo half-up", () => {
  assert.equal(applyBps(10, 1500), 2); // 1.5 → 2
  assert.equal(applyBps(3, 1500), 0); // 0.45 → 0
});

test("toMinor no usa floats", () => {
  assert.equal(toMinor("0.1", "MXN"), 10);
  assert.equal(toMinor("600.5", "MXN"), 60050);
  assert.equal(toMinor("1500", "JPY"), 1500);
  assert.throws(() => toMinor("-5", "MXN"));
  assert.throws(() => toMinor("abc", "MXN"));
});

test("precio por hora × duración", () => {
  assert.equal(serviceSubtotal({ pricingType: "HOURLY", priceMinor: 35000, durationMin: 90 }), 52500);
  assert.equal(serviceSubtotal({ pricingType: "FIXED", priceMinor: 60000, durationMin: 120 }), 60000);
});

test("conversión de moneda para mostrar", () => {
  // 1 MXN ≈ 0.055 USD → 55_000 micros
  assert.equal(convertMinor(50000, 55_000), 2750);
});
