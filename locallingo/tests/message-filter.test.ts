import { test } from "node:test";
import assert from "node:assert/strict";
import { filterMessage } from "../src/lib/message-filter";

test("bloquea números de tarjeta válidos", () => {
  const r = filterMessage("mi tarjeta es 4242 4242 4242 4242");
  assert.equal(r.blocked, true);
});

test("oculta teléfonos y emails", () => {
  const r = filterMessage("escríbeme a juan@mail.com o al 669 123 4567");
  assert.equal(r.blocked, false);
  assert.equal(r.redacted, true);
  assert.ok(!r.body.includes("juan@mail.com"));
  assert.ok(!r.body.includes("4567"));
});

test("deja pasar mensajes normales, horas y precios", () => {
  const r = filterMessage("Nos vemos a las 10:30 en el malecón, son 2 horas por $600");
  assert.equal(r.redacted, false);
  assert.equal(r.blocked, false);
});
