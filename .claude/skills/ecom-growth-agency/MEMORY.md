# MEMORY.md — Memoria de la agencia (ecom-growth-agency)

Registro de decisiones, aprendizajes y estado de cada producto. Se actualiza en cuanto se
aprenda algo importante — no al final de la sesión. Ver `references/response-protocol.md`,
sección "Registro en memoria".

---

## 2026-08-23 — Fundación del sistema

- Se construyó la agencia completa como skill independiente (`ecom-growth-agency`), separada de
  cualquier otra identidad de este repositorio (no lee ni escribe `Harvey/*.md`).
- Roster de 24 roles definido en `references/team-roster.md`.
- Se documentaron los 20+ sistemas operativos de la agencia (research, competencia, ángulos,
  hooks, UGC, formatos de video, funnel, oferta/pricing, landing, SEO, distribución/producción,
  automatización, testing/winners, comentarios/retargeting, email/SMS, customer service,
  branding, analítica, reglas de decisión/escalamiento, research diario, protocolo de
  respuesta) en `references/`.
- **Regla de compliance de salud/belleza fijada como no negociable** en
  `references/compliance-health-claims.md` — aplica a todo output de la agencia.
- **Primer research pass completado** para los 5 productos iniciales (máscara LED, roller, gua
  sha, masajeador facial/corporal, kit combinado), con datos de mercado reales y fuentes
  citadas (ver `products/`). Ningún costo real de proveedor confirmado todavía — pendiente
  antes de fijar precios finales o calcular margen real.
- **Decisión preliminar de portafolio**: tratar el roller y el gua sha como productos de
  entrada/tripwire (muy saturados como SKU suelto), el masajeador facial/corporal como
  candidato más fuerte a "hero product" individual, y el kit combinado como oferta ancla de
  marca hacia la que debe apuntar el funnel completo.
- **Pendiente crítico abierto**: confirmar con proveedor(es) real(es) — costo por unidad, costo
  de envío, tiempo de envío, especificación técnica verificada (longitud de onda LED, si el
  masajeador es resistente al agua/tiene calor) — antes de avanzar a `unit-economics` y fijar
  precio final de cualquier producto o del kit.
- **Próximo paso operativo**: en cuanto haya proveedor y costos reales, correr
  `references/offer-pricing-aov.md` completo por producto y decidir con cuál se abre el primer
  test (`references/testing-winner-detection.md`), empezando en el primer escalón de
  `references/decision-rules-scaling.md` ($50/día).

## 2026-08-23 — Primer costo real confirmado: Máscara facial LED

- Alberto confirmó costo real del producto ($15) y precio de venta ($100) para la máscara LED.
  Margen bruto de producto: $85 (85%) — el mejor margen de los 5 productos del portafolio.
- Con margen bruto conocido, el score subió de "no calculable" a **71/100 (banda TEST)** —
  ver `products/01-led-face-mask.md`.
- Siguen pendientes de confirmar: costo real de envío, packaging, y % de devoluciones esperado.
  Se documentó un modelo ilustrativo con esos 3 valores marcados explícitamente como estimación
  (no como dato confirmado) para no romper la regla de "nunca inventar costos".
- **Decisión del CEO**: la máscara LED es el producto que abre el primer test de la agencia,
  no el kit combinado — presupuesto inicial $50/día, ángulo "ritual nocturno"/self-care como
  prioridad por menor riesgo de compliance.
- **Pendiente para cerrar unit economics al 100%**: costo de envío real, packaging real, %
  de devoluciones real o estimado por el propio historial/proveedor.

## 2026-08-23 — Costos reales confirmados: Rodillo y Gua Sha

- Alberto confirmó costo $13 / precio $30 para **ambos**, rodillo facial y gua sha (mismos
  números para los dos). Margen bruto de producto: $17 (56.7%) cada uno.
- ROAS mínimo de breakeven calculado ≈ 2.84x para ambos — casi el doble de exigente que la
  máscara LED (1.49x). **Esto confirma con datos reales la recomendación previa**: ni el
  rodillo ni el gua sha se testean como hero product suelto; van como tripwire/entrada y como
  componentes del kit combinado.
- Score actualizado en ambos archivos: Margen pasa de "pendiente" a 6/10 (margen % sólido, pero
  ROAS de breakeven exigente).
- Aclarado con Alberto: el precio de $100 mencionado en el mensaje anterior correspondía a la
  máscara LED (ya registrado), no a un producto nuevo.
- **Pendiente crítico restante**: costo y precio de venta reales del **masajeador
  facial/corporal (producto 4)** — es el único de los 5 productos sin datos confirmados. El
  kit combinado (producto 5) sigue sin precio propio, pendiente de definir cuando estén todos
  los componentes.
