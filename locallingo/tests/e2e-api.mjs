// Prueba end-to-end del API v1 contra un servidor corriendo (BASE_URL).
// Uso: npm run build && npm start (en otra terminal) && node tests/e2e-api.mjs
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
async function call(path, { token, method, body } = {}) {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    method: method ?? (body ? "POST" : "GET"),
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  return { status: res.status, ...json };
}
const login = async (email) => (await call("/auth/login", { body: { email, password: "demo1234" } })).data.token;
const step = (m) => console.log("✓", m);

// Próximo lunes (María trabaja L–S 9:00–18:00, hora de Mazatlán)
const d = new Date();
d.setUTCDate(d.getUTCDate() + ((8 - d.getUTCDay()) % 7 || 7) + 7);
const date = d.toISOString().slice(0, 10);

const bad = await call("/auth/login", { body: { email: "turista@demo.com", password: "wrong" } });
assert.equal(bad.error.code, "INVALID_CREDENTIALS");
step("login incorrecto rechazado");

const tourist = await login("turista@demo.com");
const guide = await login("guia@demo.com");
const admin = await login("admin@demo.com");
step("login de turista, guía y admin");

assert.equal((await call("/admin/stats", { token: tourist })).status, 403);
assert.equal((await call("/guide/profile", { token: tourist })).status, 403);
assert.equal((await call("/bookings")).status, 401);
step("permisos por rol");

const results = (await call("/guides?city=mazatlan&language=en")).data;
assert.ok(results.length >= 3);
assert.ok(results.every((g) => g.languages.some((l) => l.code === "en")));
const maria = (await call("/guides/maria-lopez")).data.guide;
assert.equal(maria.idDocumentKey, undefined);
assert.ok(!JSON.stringify(maria).includes("private/"));
step(`búsqueda (${results.length} guías) y perfil público sin datos privados`);

const tour = maria.services.find((s) => s.pricingType === "FIXED");
const quote = (await call("/bookings/quote", { body: { serviceId: tour.id } })).data;
assert.equal(quote.totalMinor, 60000);
assert.equal(quote.commissionMinor, 9000);
assert.equal(quote.guideNetMinor, 51000);
step("cotización: $600 → comisión $90, guía $510");

const outside = await call("/bookings", { token: tourist, body: { serviceId: tour.id, date, time: "20:00", people: 2 } });
assert.equal(outside.error.code, "SLOT_UNAVAILABLE");
step("rechaza horario fuera de disponibilidad");

const b = (await call("/bookings", { token: tourist, body: { serviceId: tour.id, date, time: "10:00", people: 2 } })).data;
const overlap = await call("/bookings", { token: tourist, body: { serviceId: tour.id, date, time: "11:00", people: 1 } });
assert.equal(overlap.error.code, "SLOT_UNAVAILABLE");
step(`reserva ${b.code} creada; empalme rechazado`);

assert.equal((await call(`/bookings/${b.id}/accept`, { token: guide, body: {} })).error.code, "INVALID_STATE");
await call(`/bookings/${b.id}/pay`, { token: tourist, body: {} });
let bk = (await call(`/bookings/${b.id}`, { token: tourist })).data;
assert.equal(bk.status, "PENDING");
assert.equal(bk.payments[0].status, "HELD");
step("pago retenido → esperando al guía");

const other = await login("jorge@demo.com");
assert.equal((await call(`/bookings/${b.id}`, { token: other })).status, 404);
step("otro guía no puede ver la reserva");

await call(`/bookings/${b.id}/accept`, { token: guide, body: {} });
bk = (await call(`/bookings/${b.id}`, { token: tourist })).data;
assert.equal(bk.status, "ACCEPTED");
assert.equal(bk.payments[0].status, "CAPTURED");
step("guía acepta → pago capturado");

const cancel = (await call(`/bookings/${b.id}/cancel`, { token: tourist, body: {} })).data;
assert.equal(cancel.refundMinor, 60000); // >48h antes con política moderada
step("cancelación con reembolso completo según política");

const conv = (await call("/conversations", { token: tourist, body: { guideId: maria.id } })).data;
const m1 = (await call(`/conversations/${conv.id}/messages`, { token: tourist, body: { body: "Hola! mi cel es 669 123 4567" } })).data;
assert.equal(m1.redacted, true);
const m2 = await call(`/conversations/${conv.id}/messages`, { token: tourist, body: { body: "tarjeta 4242 4242 4242 4242" } });
assert.equal(m2.error.code, "CARD_NUMBER");
const thread = (await call(`/conversations/${conv.id}`, { token: guide })).data;
assert.ok(!thread.messages.some((m) => m.body.includes("4567")));
step("chat: teléfono oculto, tarjeta bloqueada");

await call("/blocks", { token: guide, body: { userId: thread.otherId, blocked: true } });
assert.equal((await call(`/conversations/${conv.id}/messages`, { token: tourist, body: { body: "hola?" } })).error.code, "BLOCKED");
await call("/blocks", { token: guide, body: { userId: thread.otherId, blocked: false } });
step("bloqueo de usuario");

assert.ok((await call("/reports", { token: tourist, body: { reason: "SPAM", conversationId: conv.id } })).data.id);
step("reporte creado");

await call("/admin/settings", { token: admin, method: "PUT", body: { commissionBps: 1200 } });
assert.equal((await call("/bookings/quote", { body: { serviceId: tour.id } })).data.commissionMinor, 7200);
await call("/admin/settings", { token: admin, method: "PUT", body: { commissionBps: 1500 } });
step("admin cambia la comisión (15% → 12% → 15%)");

const pending = (await call("/admin/stats", { token: admin })).data;
assert.ok(pending.pendingGuides >= 1);
step(`métricas admin: ${pending.users} usuarios, ${pending.bookings} reservas, conversión ${pending.conversionPct}%`);

const email = `nuevo${Date.now()}@demo.com`;
const reg = (await call("/auth/register", { body: { name: "Nueva Guía", email, password: "segura123", role: "GUIDE" } })).data;
const g2 = reg.token;
assert.equal((await call("/guide/submit", { token: g2, body: {} })).error.code, "INCOMPLETE_PROFILE");
const cat = (await call("/catalog")).data;
const es = cat.languages.find((l) => l.code === "es").id;
await call("/guide/profile", { token: g2, method: "PUT", body: { cityId: cat.cities.find((c) => c.slug === "mazatlan").id, headline: "Test", idDocumentKey: "private/x.pdf" } });
await call("/guide/languages", { token: g2, method: "PUT", body: [{ languageId: es, level: "NATIVE" }] });
await call("/guide/services", { token: g2, method: "PUT", body: [{ categoryId: cat.categories[0].id, title: "Traducción", pricingType: "HOURLY", price: "300", durationMin: 60, modality: "IN_PERSON", languageIds: [es] }] });
await call("/guide/availability", { token: g2, method: "PUT", body: [{ weekday: 1, startMinute: 540, endMinute: 1080 }] });
assert.equal((await call("/guide/submit", { token: g2, body: {} })).data.status, "PENDING");
const slugRes = await call("/guides?city=mazatlan");
assert.ok(!slugRes.data.some((g) => g.displayName === "Nueva Guía"));
step("registro de guía → pendiente de verificación (no aparece en búsqueda)");

const tooShort = await call("/auth/register", { body: { name: "X", email: "bad", password: "1", role: "ADMIN" } });
assert.equal(tooShort.error.code, "VALIDATION_ERROR");
step("registro público no permite crear ADMIN ni datos inválidos");

console.log("\nTodo OK");
